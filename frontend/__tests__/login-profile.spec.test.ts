import { expect, type Page, type Route, test } from "@playwright/test";

type GraphQLBody = {
  operationName?: string;
  variables?: Record<string, any>;
};

type LoginState = {
  isLoggedIn: boolean;
  loginVariables: Record<string, any> | null;
  updateProfileInput: Record<string, any> | null;
  profileData: Record<string, any> | null;
};

function parseGraphQLBody(raw: string | null): GraphQLBody {
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as GraphQLBody;
  } catch {
    return {};
  }
}

async function fulfillGraphQL(route: Route, data: unknown) {
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ data }),
  });
}

async function installGraphQLMocks(page: Page) {
  const state: LoginState = {
    isLoggedIn: false,
    loginVariables: null,
    updateProfileInput: null,
    profileData: null,
  };

  await page.route("**/graphql", async (route: Route) => {
    const request = route.request();
    const body = parseGraphQLBody(request.postData());
    const operationName = body.operationName;
    const variables = body.variables ?? {};

    switch (operationName) {
      case "Login":
        state.loginVariables = variables;
        state.isLoggedIn = true;
        await fulfillGraphQL(route, { login: true });
        return;

      case "profile":
        await fulfillGraphQL(route, {
          me: state.isLoggedIn
            ? {
                id: "1",
                email: "alice@example.com",
                createdAt: "2026-02-01T10:00:00.000Z",
                role: "Coachee",
              }
            : null,
        });
        return;

      case "UserDashboardData":
        await fulfillGraphQL(route, {
          userDashboardData: {
            firstName: "Alice",
            daysOfUse: 12,
            healthScore: 74,
            scannedMeals: 22,
            averageCalories: 1840,
            targetCalories: 1800,
            targetProgress: 82,
            targetProtein: 120,
            targetCarbs: 180,
            targetLipids: 60,
            todayProtein: 95,
            todayCarbs: 140,
            todayFat: 44,
            hasMoreMeals: false,
            recentMeals: [],
          },
        });
        return;

      case "UserProfileData":
        await fulfillGraphQL(route, {
          userProfileData: state.profileData,
        });
        return;

      case "UpdateUserProfileData":
        state.updateProfileInput = variables.data ?? null;
        state.profileData = variables.data ?? null;
        await fulfillGraphQL(route, {
          updateUserProfileData: state.profileData,
        });
        return;

      case "Logout":
        state.isLoggedIn = false;
        await fulfillGraphQL(route, { logout: true });
        return;

      default:
        // Allow unrelated queries fired by the app shell without failing the flow.
        await fulfillGraphQL(route, {});
    }
  });

  return state;
}

test("login + create profile in a real browser flow", async ({ page }: { page: Page }) => {
  const state = await installGraphQLMocks(page);

  await page.goto("/login");

  await page.getByLabel("Email").fill("alice@example.com");
  await page.getByLabel(/mot de passe/i).fill("Password1!");
  await page.getByRole("button", { name: "Se connecter" }).click();

  await page.waitForURL("**/dashboard_user");
  await expect(page.getByText(/Bienvenue dans ta tour de controle Alice/i)).toBeVisible();

  expect(state.loginVariables).toEqual({
    data: { email: "alice@example.com", password: "Password1!" },
  });

  await page.getByRole("link", { name: "Mon Profile" }).click();
  await page.waitForURL("**/user_profile");

  await page.getByLabel("Prenom").fill("Alice");
  await page.getByLabel("Nom de famille").fill("Martin");
  await page.locator("#height").fill("168");
  await page.locator("#weight").fill("62");
  await page.locator("#goal").fill(" Perdre du poids ");
  await page.getByPlaceholder("Ajouter une information medicale").fill("allergie");
  await page.getByRole("button", { name: "Ajouter" }).click();
  await page.getByRole("radio", { name: "Homme" }).check();
  await page.getByRole("button", { name: "Enregistrer" }).click();

  await expect(page.getByText("Profil enregistré.")).toBeVisible();

  expect(state.updateProfileInput).toEqual({
    firstName: "Alice",
    lastName: "Martin",
    dateOfBirth: "1984-06-12",
    gender: "homme",
    height: 168,
    currentWeight: 62,
    goal: "Perdre du poids",
    medicalTags: ["allergie"],
  });
});
