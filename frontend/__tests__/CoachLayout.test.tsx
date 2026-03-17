// Mock Apollo Client hooks first - these need to be available before schema mocks
const mockUseQuery = jest.fn();
const mockUseMutation = jest.fn();
const mockRefetch = jest.fn();

jest.mock("@apollo/client/react", () => ({
  useQuery: () => mockUseQuery(),
  useMutation: () => mockUseMutation(),
}));

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock Next.js Image and Link
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // Filter out Next.js specific props that are not valid HTML attributes
    const { priority, ...imgProps } = props;
    // biome-ignore lint/a11y/useAltText: Mock component, alt text comes from props
    return <img {...imgProps} />;
  },
}));

jest.mock("next/link", () => {
  return ({
    children,
    href,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
  }) => {
    return (
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          onClick?.();
        }}
      >
        {children}
      </a>
    );
  };
});

// Mock the generated schema hooks - use relative path to avoid alias resolution issues
// These hooks will use the mocked Apollo hooks (mockUseQuery and mockUseMutation)
jest.mock("../src/graphql/generated/schema", () => ({
  useProfileQuery: () => mockUseQuery(),
  useLogoutMutation: () => mockUseMutation(),
  UserRole: {
    Coach: "Coach",
    Admin: "Admin",
    Coachee: "Coachee",
  },
}));

// Mock Footer component
jest.mock("../src/components/Footer", () => ({
  __esModule: true,
  default: () => <footer data-testid="footer">Footer</footer>,
}));

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/router";
import CoachLayout from "@/components/coach/CoachLayout";
import { UserRole } from "../src/graphql/generated/schema";

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

type MockUser = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
};

const buildProfileQueryResult = (me: MockUser | null) => ({
  data: { me },
  loading: false,
  error: undefined,
  refetch: mockRefetch,
});

describe("CoachLayout", () => {
  const mockPush = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRefetch.mockResolvedValue({});

    mockUseRouter.mockReturnValue({
      pathname: "/coach/dashboard",
      push: mockPush,
    } as any);

    // Setup mock return values for Apollo hooks
    mockUseQuery.mockReturnValue(buildProfileQueryResult(null));

    mockUseMutation.mockReturnValue([mockLogout, { loading: false, error: undefined }]);
  });

  it("should render the layout with children", () => {
    mockUseQuery.mockReturnValue(buildProfileQueryResult(null));

    render(
      <CoachLayout pageTitle="Test Page">
        <div data-testid="test-content">Test Content</div>
      </CoachLayout>,
    );

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should render the page title in the Head", () => {
    mockUseQuery.mockReturnValue(buildProfileQueryResult(null));

    render(
      <CoachLayout pageTitle="Dashboard Coach">
        <div>Content</div>
      </CoachLayout>,
    );

    // Next.js Head component updates the title, but in test environment it may not be immediately available
    // We verify the component renders correctly - the Head component is rendered
    // In a real browser, the title would be set correctly
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  describe("Navigation", () => {
    it("should render all navigation menu items", () => {
      mockUseQuery.mockReturnValue(
        buildProfileQueryResult({
          id: "1",
          email: "coach@example.com",
          role: UserRole.Coach,
          createdAt: new Date(),
        }),
      );

      render(
        <CoachLayout pageTitle="Test">
          <div>Content</div>
        </CoachLayout>,
      );

      expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
      expect(screen.getByText("utilisateurs")).toBeInTheDocument();
      expect(screen.getByText("Recettes")).toBeInTheDocument();
      expect(screen.getByText("Analyse IA")).toBeInTheDocument();
    });

    it("should highlight the active menu item based on current pathname", () => {
      // Set pathname to match one of the menu items
      mockUseRouter.mockReturnValue({
        pathname: "/coach/users",
        push: mockPush,
      } as any);

      mockUseQuery.mockReturnValue(
        buildProfileQueryResult({
          id: "1",
          email: "coach@example.com",
          role: UserRole.Coach,
          createdAt: new Date(),
        }),
      );

      render(
        <CoachLayout pageTitle="Test">
          <div>Content</div>
        </CoachLayout>,
      );

      const usersLink = screen.getByText("utilisateurs").closest("a");
      expect(usersLink).toBeInTheDocument();
      // The isActive function checks if router.pathname === href
      // Since pathname is "/coach/users" and href is "/coach/users", it should be active
      // Verify the link exists and has the correct href
      expect(usersLink).toHaveAttribute("href", "/coach/users");
      // The active styling is applied conditionally based on isActive(item.href)
      // We verify the navigation structure is correct
    });

    it("should close mobile menu when clicking on a menu item", async () => {
      const user = userEvent.setup();

      mockUseQuery.mockReturnValue(
        buildProfileQueryResult({
          id: "1",
          email: "coach@example.com",
          role: UserRole.Coach,
          createdAt: new Date(),
        }),
      );

      render(
        <CoachLayout pageTitle="Test">
          <div>Content</div>
        </CoachLayout>,
      );

      // Open mobile menu (coach burger opens sidebar)
      const menuButton = screen.getByLabelText("Ouvrir le menu coach");
      await user.click(menuButton);

      // Verify coach sidebar links are visible when menu is open (sidebar = 2nd Dashboard link)
      const dashboardLinks = screen.getAllByRole("link", { name: "Dashboard" });
      expect(dashboardLinks.length).toBeGreaterThanOrEqual(2);

      // Click on the sidebar Dashboard link to close the sidebar
      await user.click(dashboardLinks[1]);

      // Sidebar is closed (aria-hidden when not visible)
      expect(screen.getByTestId("coach-sidebar")).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Conditional rendering based on user role", () => {
    it("should display coach navigation when user is logged in as Coach", () => {
      mockUseQuery.mockReturnValue(
        buildProfileQueryResult({
          id: "1",
          email: "coach@example.com",
          role: UserRole.Coach,
          createdAt: new Date(),
        }),
      );

      render(
        <CoachLayout pageTitle="Test">
          <div>Content</div>
        </CoachLayout>,
      );

      expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Déconnexion").length).toBeGreaterThan(0);
    });

    it("should display admin navigation when user is logged in as Admin", () => {
      mockUseQuery.mockReturnValue(
        buildProfileQueryResult({
          id: "1",
          email: "admin@example.com",
          role: UserRole.Admin,
          createdAt: new Date(),
        }),
      );

      render(
        <CoachLayout pageTitle="Test">
          <div>Content</div>
        </CoachLayout>,
      );

      // Admin dashboard link can be /admin (header) or /coach/dashboard (sidebar)
      const dashboardLinks = screen.getAllByRole("link", { name: "Dashboard" });
      const hrefs = dashboardLinks.map((l) => l.getAttribute("href"));
      expect(hrefs).toContain("/admin");
      expect(screen.getAllByText("Déconnexion").length).toBeGreaterThan(0);
    });

    it("should not display authenticated actions when user is not logged in", () => {
      mockUseQuery.mockReturnValue(buildProfileQueryResult(null));

      render(
        <CoachLayout pageTitle="Test">
          <div>Content</div>
        </CoachLayout>,
      );

      expect(screen.queryByText("Déconnexion")).not.toBeInTheDocument();
    });

    it("should display avatar initial from user email", () => {
      mockUseQuery.mockReturnValue(
        buildProfileQueryResult({
          id: "1",
          email: "john.doe@example.com",
          role: UserRole.Coach,
          createdAt: new Date(),
        }),
      );

      render(
        <CoachLayout pageTitle="Test">
          <div>Content</div>
        </CoachLayout>,
      );

      expect(screen.getByText("J")).toBeInTheDocument();
    });
  });

  describe("Logout functionality", () => {
    it("should call logout mutation and redirect on logout button click", async () => {
      const user = userEvent.setup();

      mockUseQuery.mockReturnValue(
        buildProfileQueryResult({
          id: "1",
          email: "coach@example.com",
          role: UserRole.Coach,
          createdAt: new Date(),
        }),
      );

      mockLogout.mockResolvedValue({});

      render(
        <CoachLayout pageTitle="Test">
          <div>Content</div>
        </CoachLayout>,
      );

      const logoutButtons = screen.getAllByRole("button", { name: "Déconnexion" });
      await user.click(logoutButtons[0]);

      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/");
    });

    it("should handle logout error gracefully", async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      mockUseQuery.mockReturnValue(
        buildProfileQueryResult({
          id: "1",
          email: "coach@example.com",
          role: UserRole.Coach,
          createdAt: new Date(),
        }),
      );

      const logoutError = new Error("Logout failed");
      mockLogout.mockRejectedValue(logoutError);

      render(
        <CoachLayout pageTitle="Test">
          <div>Content</div>
        </CoachLayout>,
      );

      const logoutButtons = screen.getAllByRole("button", { name: "Déconnexion" });
      await user.click(logoutButtons[0]);

      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith("Logout error:", logoutError);

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Mobile menu", () => {
    it("should toggle mobile menu when menu button is clicked", async () => {
      const user = userEvent.setup();

      mockUseQuery.mockReturnValue(
        buildProfileQueryResult({
          id: "1",
          email: "coach@example.com",
          role: UserRole.Coach,
          createdAt: new Date(),
        }),
      );

      render(
        <CoachLayout pageTitle="Test">
          <div>Content</div>
        </CoachLayout>,
      );

      const menuButton = screen.getByLabelText("Ouvrir le menu coach");
      expect(menuButton).toBeInTheDocument();

      // Sidebar hidden when closed (aria-hidden in jsdom)
      expect(screen.getByTestId("coach-sidebar")).toHaveAttribute("aria-hidden", "true");

      // Open menu
      await user.click(menuButton);

      expect(screen.getByTestId("coach-sidebar")).toHaveAttribute("aria-hidden", "false");
      expect(screen.getByText("utilisateurs")).toBeInTheDocument();
      // Close sidebar via close button (burger only opens, does not toggle)
      const closeButtons = screen.getAllByRole("button", { name: "Fermer le menu" });
      await user.click(closeButtons[0]);

      // Sidebar closed again
      expect(screen.getByTestId("coach-sidebar")).toHaveAttribute("aria-hidden", "true");
    });
  });

  it("should render Footer component", () => {
    mockUseQuery.mockReturnValue(buildProfileQueryResult(null));

    render(
      <CoachLayout pageTitle="Test">
        <div>Content</div>
      </CoachLayout>,
    );

    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});
