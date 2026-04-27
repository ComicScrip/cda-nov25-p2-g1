export type ScannerAnalysisPayload = {
  plats_probables?: string[] | null;
  portion_estimee?: string | null;
  incertitudes?: string[] | null;
  questions_suivi?: string[] | null;
  avertissement_pathologies?: string[] | null;
};

const cleanText = (value: string | null | undefined): string | null => {
  const normalized = value?.replace(/\s+/g, " ").trim();
  return normalized ? normalized : null;
};

const dedupe = (items: string[]): string[] => {
  return [...new Set(items)];
};

const normalizeStringList = (values: string[] | null | undefined): string[] => {
  if (!values) {
    return [];
  }

  return dedupe(
    values.map((value) => cleanText(value)).filter(Boolean) as string[],
  );
};

const withPrefix = (items: string[], prefix: string): string[] => {
  return items.map((item) => `${prefix}${item}`);
};

export const splitStoredInsights = (
  value: string | null | undefined,
): string[] => {
  const rawValue = value?.trim();
  if (!rawValue) {
    return [];
  }

  return dedupe(
    rawValue
      .split(/\r?\n|;/)
      .map((item) => cleanText(item))
      .filter(Boolean) as string[],
  );
};

export const buildScannerAnalysisInsights = (
  analysis: ScannerAnalysisPayload | null | undefined,
): string[] => {
  if (!analysis) {
    return [];
  }

  const insights: string[] = [];
  const probableDish = normalizeStringList(analysis.plats_probables)[0];
  const portion = cleanText(analysis.portion_estimee);

  if (probableDish) {
    insights.push(`Plat probable: ${probableDish}`);
  }

  if (portion) {
    insights.push(`Portion estimee: ${portion}`);
  }

  insights.push(...normalizeStringList(analysis.avertissement_pathologies));
  insights.push(
    ...withPrefix(normalizeStringList(analysis.incertitudes), "Incertitude: "),
  );
  insights.push(
    ...withPrefix(
      normalizeStringList(analysis.questions_suivi),
      "Question de suivi: ",
    ),
  );

  return dedupe(insights);
};

export const buildScannerAnalysisWarningsText = (
  analysis: ScannerAnalysisPayload | null | undefined,
): string | undefined => {
  const insights = buildScannerAnalysisInsights(analysis);
  return insights.length > 0 ? insights.join("\n") : undefined;
};
