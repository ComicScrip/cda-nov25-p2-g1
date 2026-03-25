import {
  buildScannerAnalysisInsights,
  buildScannerAnalysisWarningsText,
  splitStoredInsights,
} from "../src/utils/scannerInsights";

describe("scannerInsights", () => {
  it("builds readable insights from scanner analysis payload", () => {
    const insights = buildScannerAnalysisInsights({
      plats_probables: ["Bowl granola fruits rouges"],
      portion_estimee: "Bol moyen, environ 280 g",
      avertissement_pathologies: ["Attention au sucre si insulinorésistance."],
      incertitudes: ["Le type exact de lait n'est pas visible."],
      questions_suivi: ["Y a-t-il eu un sucrant ajouté ?"],
    });

    expect(insights).toEqual([
      "Plat probable: Bowl granola fruits rouges",
      "Portion estimee: Bol moyen, environ 280 g",
      "Attention au sucre si insulinorésistance.",
      "Incertitude: Le type exact de lait n'est pas visible.",
      "Question de suivi: Y a-t-il eu un sucrant ajouté ?",
    ]);
  });

  it("serializes and reads stored insights with mixed separators", () => {
    const stored = buildScannerAnalysisWarningsText({
      plats_probables: ["Porridge"],
      portion_estimee: "Petit bol",
      avertissement_pathologies: ["Apport glucidique notable."],
    });

    expect(stored).toBe(
      "Plat probable: Porridge\nPortion estimee: Petit bol\nApport glucidique notable.",
    );
    expect(
      splitStoredInsights("Premiere ligne; Deuxieme ligne\nTroisieme ligne"),
    ).toEqual(["Premiere ligne", "Deuxieme ligne", "Troisieme ligne"]);
  });
});
