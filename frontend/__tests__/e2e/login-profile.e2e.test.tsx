import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import Login from "@/pages/login";
import UserProfilePage from "@/pages/user_profile";

const mockPush = jest.fn();
const mockLogin = jest.fn();
const mockUpdateProfile = jest.fn();
const mockLogout = jest.fn();
const mockProfileQuery = jest.fn();
const mockUserProfileDataQuery = jest.fn();
const mockRefetchProfile = jest.fn();
const mockUseQuery = jest.fn();
const mockUseMutation = jest.fn();
const mockClearStore = jest.fn();

jest.mock("next/router", () => ({
  useRouter: () => ({ push: mockPush, query: {} }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock("@/components/HomeLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/graphql/generated/schema", () => ({
  UserRole: {
    Admin: "Admin",
    Coach: "Coach",
    Coachee: "Coachee",
  },
  useLoginMutation: () => [mockLogin, { loading: false, error: undefined }],
  useLogoutMutation: () => [mockLogout, { loading: false, error: undefined }],
  useProfileQuery: (...args: unknown[]) => mockProfileQuery(...args),
  useUserProfileDataQuery: (...args: unknown[]) => mockUserProfileDataQuery(...args),
  useUpdateUserProfileDataMutation: () => [mockUpdateProfile, { loading: false, error: undefined }],
}));

jest.mock("@apollo/client/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
  useApolloClient: () => ({
    clearStore: mockClearStore,
  }),
}));

function getInputById(id: string) {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
    throw new Error(`Expected input or textarea with id="${id}"`);
  }
  return element;
}

describe("E2E flow - login and profile creation", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockLogin.mockReset();
    mockUpdateProfile.mockReset();
    mockLogout.mockReset();
    mockProfileQuery.mockReset();
    mockUserProfileDataQuery.mockReset();
    mockRefetchProfile.mockReset();
    mockUseQuery.mockReset();
    mockUseMutation.mockReset();
    mockClearStore.mockReset();

    mockLogin.mockResolvedValue({ data: { login: true } });
    mockUpdateProfile.mockResolvedValue({ data: { updateUserProfileData: {} } });
    mockLogout.mockResolvedValue({ data: { logout: true } });
    mockRefetchProfile.mockResolvedValue({
      data: { me: { role: "Coachee", email: "alice@example.com" }, profile: null },
    });

    mockProfileQuery.mockReturnValue({
      data: { me: null, profile: null },
      loading: false,
      error: undefined,
      refetch: mockRefetchProfile,
    });

    mockUserProfileDataQuery.mockReturnValue({
      data: { userProfileData: null },
      loading: false,
      error: undefined,
    });

    mockClearStore.mockResolvedValue(undefined);
    mockUseMutation.mockReturnValue([mockLogin, { loading: false, error: undefined }]);
  });

  it("logs in and redirects to the dashboard", async () => {
    const user = userEvent.setup();

    render(<Login />);

    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/mot de passe/i), "Password1!");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith({
        variables: { data: { email: "alice@example.com", password: "Password1!" } },
      }),
    );

    expect(mockPush).toHaveBeenCalledWith("/dashboard_user");
  });

  it("creates profile data and displays a success message", async () => {
    const user = userEvent.setup();

    render(<UserProfilePage />);

    const firstNameInput = screen.getByLabelText("Prenom");
    const lastNameInput = screen.getByLabelText("Nom de famille");
    const heightInput = getInputById("height");
    const weightInput = getInputById("weight");
    const goalInput = getInputById("goal");

    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Alice");
    await user.clear(lastNameInput);
    await user.type(lastNameInput, "Martin");
    await user.type(heightInput, "168");
    await user.type(weightInput, "62");
    await user.type(goalInput, " Perdre du poids ");

    await user.type(screen.getByPlaceholderText("Ajouter une information medicale"), "allergie");
    await user.click(screen.getByRole("button", { name: "Ajouter" }));
    await user.click(screen.getByRole("radio", { name: "Homme" }));
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() =>
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        variables: {
          data: {
            firstName: "Alice",
            lastName: "Martin",
            dateOfBirth: "1984-06-12",
            gender: "homme",
            height: 168,
            currentWeight: 62,
            goal: "Perdre du poids",
            medicalTags: ["allergie"],
          },
        },
      }),
    );

    expect(await screen.findByText("Profil enregistré.")).toBeInTheDocument();
  });
});
