import {
  getProviderRemainingTokens,
  orderProvidersForAuto,
  recordRuntimeTokenUsage,
  resetRuntimeTokenUsage,
} from "@/pages/api/meal-analysis";

describe("meal-analysis token budgets", () => {
  const originalOpenaiBudget = process.env.OPENAI_TOKEN_BUDGET;
  const originalGeminiBudget = process.env.GEMINI_TOKEN_BUDGET;

  beforeEach(() => {
    resetRuntimeTokenUsage();
    process.env.OPENAI_TOKEN_BUDGET = "2";
    process.env.GEMINI_TOKEN_BUDGET = "1";
  });

  afterAll(() => {
    if (originalOpenaiBudget === undefined) {
      delete process.env.OPENAI_TOKEN_BUDGET;
    } else {
      process.env.OPENAI_TOKEN_BUDGET = originalOpenaiBudget;
    }

    if (originalGeminiBudget === undefined) {
      delete process.env.GEMINI_TOKEN_BUDGET;
    } else {
      process.env.GEMINI_TOKEN_BUDGET = originalGeminiBudget;
    }

    resetRuntimeTokenUsage();
  });

  it("calcule les tokens restants par provider", () => {
    expect(getProviderRemainingTokens("openai")).toBe(2);
    expect(getProviderRemainingTokens("gemini")).toBe(1);

    recordRuntimeTokenUsage("openai", 1);
    recordRuntimeTokenUsage("gemini", 1);

    expect(getProviderRemainingTokens("openai")).toBe(1);
    expect(getProviderRemainingTokens("gemini")).toBe(0);
  });

  it("choisit gpt en premier si gpt a plus de tokens restants", () => {
    const orderedProviders = orderProvidersForAuto(["gemini", "openai"]);
    expect(orderedProviders).toEqual(["openai", "gemini"]);
  });

  it("bascule sur gemini quand le budget gpt est epuise", () => {
    recordRuntimeTokenUsage("openai", 2);

    const orderedProviders = orderProvidersForAuto(["openai", "gemini"]);
    expect(orderedProviders).toEqual(["gemini", "openai"]);
  });
});
