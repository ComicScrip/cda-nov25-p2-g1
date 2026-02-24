import { gql } from "@apollo/client/core";
import { useQuery } from "@apollo/client/react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import HomeLayout from "@/components/HomeLayout";
import type { ScannerMealDetails, ScannerMealDraft } from "@/lib/scannerDraft";

const SCANNER_COACH_PAYLOAD_KEY = "scannerMealCoachPayloadV1";

type NutritionRange = {
  min?: number;
  max?: number;
};

type CoachAnalysisPayload = {
  plats_probables?: string[];
  ingredients_visibles?: string[];
  portion_estimee?: string;
  nutrition_estimee?: {
    calories_kcal?: NutritionRange;
    proteines_g?: NutritionRange;
    glucides_g?: NutritionRange;
    lipides_g?: NutritionRange;
    fibres_g?: NutritionRange;
  };
  score_sante_100?: number;
  confiance_100?: number;
  incertitudes?: string[];
  questions_suivi?: string[];
  avertissement_pathologies?: string[];
};

type CoachSubmissionPayload = {
  draft?: ScannerMealDraft;
  details?: ScannerMealDetails;
  analysis?: CoachAnalysisPayload;
  reponseIncertitudes?: string;
  reponseQuestionsSuivi?: string;
  platDejaConsomme?: string | null;
  promptAnalyse?: string | null;
  requeteAnalyse?: unknown;
  savedAt?: string;
};

type CoachScannerSubmissionTestRow = {
  id: string;
  userId: string;
  userEmail?: string | null;
  createdAt: string;
  payloadJson: string;
};

type CoachScannerSubmissionsTestQueryData = {
  coachScannerSubmissionsTestData: CoachScannerSubmissionTestRow[];
};

type CoachSubmissionRecord = {
  id: string;
  userId: string;
  userEmail?: string | null;
  createdAt: string;
  payload: CoachSubmissionPayload;
  source: "db" | "session" | "fallback" | "error";
};

const COACH_SCANNER_SUBMISSIONS_TEST_QUERY = gql`
  query CoachScannerSubmissionsTestData {
    coachScannerSubmissionsTestData {
      id
      userId
      userEmail
      createdAt
      payloadJson
    }
  }
`;

const FALLBACK_PAYLOAD: CoachSubmissionPayload = {
  draft: {
    imageUrl: "/MyDietChef_image.webp",
    source: "fichier",
    savedAt: new Date().toISOString(),
    fileName: "patebolo.jpg",
  },
  details: {
    dishName: "spaguetti bolognaise",
    mealMoment: "dejeuner",
    estimatedPortions: "1 assiette",
    ingredients: "patte blanche sauce tomate boullette de boeuf",
    notes: "fait maison",
  },
  analysis: {
    plats_probables: ["Spaghetti (ou pâtes longues) type bolognaise avec légumes en dés"],
    ingredients_visibles: [
      "pâtes longues (type spaghetti)",
      "sauce tomate avec morceaux de tomate",
      "viande hachée (probable)",
    ],
    portion_estimee: "Moyenne ~350–450 g",
    nutrition_estimee: {
      calories_kcal: { min: 550, max: 850 },
      proteines_g: { min: 22, max: 40 },
      glucides_g: { min: 60, max: 100 },
      lipides_g: { min: 15, max: 35 },
      fibres_g: { min: 6, max: 12 },
    },
    score_sante_100: 58,
    confiance_100: 72,
    incertitudes: [
      "Type de pâtes (blé/complètes vs sans gluten) impossible à confirmer visuellement",
    ],
    questions_suivi: [
      "Comment te sens-tu aujourd’hui (faim, satiété, énergie) avant ou après ce repas ?",
    ],
    avertissement_pathologies: [
      "Allergie au gluten : plat potentiellement NON compatible si pâtes au blé.",
      "Hypertension : vigilance sodium de la sauce.",
      "Anneau gastrique : portion à réduire selon tolérance.",
    ],
  },
  reponseIncertitudes: "Pâtes sans gluten, sauce maison peu salée.",
  reponseQuestionsSuivi: "Satiété correcte, pas d’inconfort.",
  platDejaConsomme: "oui",
  promptAnalyse:
    "Tu es un assistant de nutrition... (exemple) Contexte utilisateur: Nom du plat : (spaguetti bolognaise) ...",
  requeteAnalyse: {
    requestedAt: new Date().toISOString(),
  },
  savedAt: new Date().toISOString(),
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function truncateDeep(value: unknown): unknown {
  if (typeof value === "string") {
    if (value.length <= 260) {
      return value;
    }

    return `${value.slice(0, 260)}… [tronqué ${value.length - 260} caractères]`;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => truncateDeep(entry));
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, truncateDeep(entry)]),
    );
  }

  return value;
}

function formatDate(value?: string): string {
  if (!value) return "Non renseigné";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("fr-FR");
}

function metricRangeLabel(range?: NutritionRange, unit?: string): string {
  if (!range || range.min === undefined || range.max === undefined) {
    return "Non renseigné";
  }
  return `${range.min} à ${range.max} ${unit ?? ""}`.trim();
}

function listOrEmpty(items?: string[]): string[] {
  return Array.isArray(items) ? items.filter((item) => typeof item === "string") : [];
}

function parseCoachSubmissionPayload(raw: string): CoachSubmissionPayload | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    return parsed as CoachSubmissionPayload;
  } catch {
    return null;
  }
}

function getSubmissionTitle(payload: CoachSubmissionPayload, submissionId: string): string {
  const dishName = payload.details?.dishName?.trim();
  const fileName = payload.draft?.fileName?.trim();

  if (dishName) return dishName;
  if (fileName) return fileName;
  return `Soumission ${submissionId.slice(0, 8)}`;
}

export default function DashboardCoachTestPage() {
  const { data, loading, error, refetch } = useQuery<CoachScannerSubmissionsTestQueryData>(
    COACH_SCANNER_SUBMISSIONS_TEST_QUERY,
    {
      fetchPolicy: "cache-and-network",
    },
  );
  const [localPayload, setLocalPayload] = useState<CoachSubmissionPayload | null>(null);
  const [localSourceLabel, setLocalSourceLabel] = useState<"session" | "fallback" | "error">(
    "fallback",
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  const loadPayload = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.sessionStorage.getItem(SCANNER_COACH_PAYLOAD_KEY);
      if (!raw) {
        setLocalPayload(FALLBACK_PAYLOAD);
        setLocalSourceLabel("fallback");
        setLoadError(null);
        return;
      }

      const parsed = parseCoachSubmissionPayload(raw);
      if (!parsed) {
        throw new Error("invalid local payload");
      }

      setLocalPayload(parsed);
      setLocalSourceLabel("session");
      setLoadError(null);
    } catch {
      setLocalPayload(FALLBACK_PAYLOAD);
      setLocalSourceLabel("error");
      setLoadError("Le payload local est invalide. Affichage d'un exemple de démonstration.");
    }
  }, []);

  useEffect(() => {
    loadPayload();
  }, [loadPayload]);

  const dbRecords = useMemo<CoachSubmissionRecord[]>(() => {
    const rows = data?.coachScannerSubmissionsTestData ?? [];

    return rows
      .map((row) => {
        const payload = parseCoachSubmissionPayload(row.payloadJson);
        if (!payload) {
          return null;
        }

        return {
          id: row.id,
          userId: row.userId,
          userEmail: row.userEmail ?? null,
          createdAt: row.createdAt,
          payload,
          source: "db" as const,
        };
      })
      .filter((row): row is CoachSubmissionRecord => Boolean(row));
  }, [data?.coachScannerSubmissionsTestData]);

  const localRecord = useMemo<CoachSubmissionRecord | null>(() => {
    if (!localPayload) {
      return null;
    }

    return {
      id: "local-preview",
      userId: "local-user",
      userEmail: localSourceLabel === "session" ? "sessionStorage (local)" : "exemple local",
      createdAt: localPayload.savedAt ?? new Date().toISOString(),
      payload: localPayload,
      source: localSourceLabel,
    };
  }, [localPayload, localSourceLabel]);

  const hasDbRecords = dbRecords.length > 0;

  const users = useMemo(() => {
    if (!hasDbRecords) {
      return [];
    }

    const map = new Map<string, { userId: string; userEmail: string; count: number }>();

    for (const record of dbRecords) {
      const existing = map.get(record.userId);
      const userEmail = record.userEmail?.trim() || `Utilisateur ${record.userId.slice(0, 8)}`;
      if (existing) {
        existing.count += 1;
      } else {
        map.set(record.userId, { userId: record.userId, userEmail, count: 1 });
      }
    }

    return Array.from(map.values()).sort((a, b) => a.userEmail.localeCompare(b.userEmail));
  }, [dbRecords, hasDbRecords]);

  useEffect(() => {
    if (!hasDbRecords) {
      setSelectedUserId(null);
      setSelectedSubmissionId(null);
      return;
    }

    setSelectedUserId((current) => {
      if (current && users.some((user) => user.userId === current)) {
        return current;
      }

      return users[0]?.userId ?? null;
    });
  }, [hasDbRecords, users]);

  const recordsForSelectedUser = useMemo(() => {
    if (!hasDbRecords || !selectedUserId) {
      return [];
    }

    return dbRecords.filter((record) => record.userId === selectedUserId);
  }, [dbRecords, hasDbRecords, selectedUserId]);

  useEffect(() => {
    if (!hasDbRecords) {
      return;
    }

    setSelectedSubmissionId((current) => {
      if (current && recordsForSelectedUser.some((record) => record.id === current)) {
        return current;
      }

      return recordsForSelectedUser[0]?.id ?? null;
    });
  }, [hasDbRecords, recordsForSelectedUser]);

  const selectedRecord = useMemo(() => {
    if (hasDbRecords) {
      return (
        recordsForSelectedUser.find((record) => record.id === selectedSubmissionId) ??
        recordsForSelectedUser[0] ??
        null
      );
    }

    return localRecord;
  }, [hasDbRecords, localRecord, recordsForSelectedUser, selectedSubmissionId]);

  const payload = selectedRecord?.payload ?? null;
  const jsonPreview = useMemo(
    () => JSON.stringify(truncateDeep(payload ?? FALLBACK_PAYLOAD), null, 2),
    [payload],
  );
  const sourceLabel = selectedRecord?.source ?? localSourceLabel;

  const analysis = payload?.analysis;
  const details = payload?.details;
  const draft = payload?.draft;
  const imageUrl = draft?.imageUrl?.trim();

  return (
    <HomeLayout pageTitle="Dashboard Coach Test" footerVariant="userSlim">
      <section className="flex flex-1 bg-[#eef3ea] px-4 py-6 md:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="rounded-xl border border-[#cfd8c8] bg-white p-5 shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-xl font-semibold text-[#243124]">Dashboard Coach Test</h1>
                <p className="mt-1 text-xs text-[#596659]">
                  Visualisation des soumissions scanner envoyées au coach (multi-utilisateurs et
                  multi-repas), avec aperçu JSON tronqué pour les longues chaînes.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                    sourceLabel === "db"
                      ? "bg-[#e7eefc] text-[#2c4f9f]"
                      : sourceLabel === "session"
                        ? "bg-[#e3f4e5] text-[#1e6a32]"
                        : sourceLabel === "error"
                          ? "bg-[#fdeaea] text-[#9a2f2f]"
                          : "bg-[#eef0ff] text-[#3c4aa1]"
                  }`}
                >
                  {sourceLabel === "db"
                    ? `Source: base (${dbRecords.length} soumission${dbRecords.length > 1 ? "s" : ""})`
                    : sourceLabel === "session"
                      ? "Source: sessionStorage"
                      : sourceLabel === "error"
                        ? "Source locale invalide (fallback)"
                        : "Source: exemple fallback"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    loadPayload();
                    void refetch();
                  }}
                  className="rounded-md bg-[#2f5f8f] px-3 py-2 text-xs font-semibold text-white"
                >
                  {loading ? "Chargement..." : "Rafraîchir"}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-3 rounded-md border border-[#efc9c9] bg-[#fff3f3] px-3 py-2 text-xs text-[#8d3333]">
                Impossible de charger les soumissions depuis la base. Affichage local/fallback.
              </div>
            )}

            {loadError && (
              <div className="mt-3 rounded-md border border-[#efc9c9] bg-[#fff3f3] px-3 py-2 text-xs text-[#8d3333]">
                {loadError}
              </div>
            )}

            <div className="mt-5 grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
              <aside className="space-y-4">
                {hasDbRecords && (
                  <>
                    <section className="rounded-lg border border-[#d5dcf0] bg-[#f6f8ff] p-4">
                      <h2 className="text-sm font-semibold text-[#334273]">Utilisateurs</h2>
                      <p className="mt-1 text-[11px] text-[#5f6d97]">
                        {users.length} utilisateur{users.length > 1 ? "s" : ""} avec soumissions.
                      </p>
                      <div className="mt-3 space-y-2">
                        {users.map((user) => {
                          const isActive = user.userId === selectedUserId;
                          return (
                            <button
                              key={user.userId}
                              type="button"
                              onClick={() => setSelectedUserId(user.userId)}
                              className={`w-full rounded-md border px-3 py-2 text-left text-xs ${
                                isActive
                                  ? "border-[#6986d8] bg-[#eaf0ff] text-[#23386f]"
                                  : "border-[#d5dcf0] bg-white text-[#3f4d74]"
                              }`}
                            >
                              <div className="font-semibold">{user.userEmail}</div>
                              <div className="mt-0.5 text-[11px]">
                                {user.count} repas enregistré{user.count > 1 ? "s" : ""}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </section>

                    <section className="rounded-lg border border-[#d5dcf0] bg-[#fbfcff] p-4">
                      <h2 className="text-sm font-semibold text-[#334273]">Repas / soumissions</h2>
                      <p className="mt-1 text-[11px] text-[#5f6d97]">
                        Sélectionne un repas pour afficher le détail envoyé au coach.
                      </p>
                      <div className="mt-3 space-y-2">
                        {recordsForSelectedUser.map((record) => {
                          const isActive = record.id === selectedSubmissionId;
                          const title = getSubmissionTitle(record.payload, record.id);
                          return (
                            <button
                              key={record.id}
                              type="button"
                              onClick={() => setSelectedSubmissionId(record.id)}
                              className={`w-full rounded-md border px-3 py-2 text-left text-xs ${
                                isActive
                                  ? "border-[#6f9f65] bg-[#ecf7e8] text-[#284d24]"
                                  : "border-[#d6e1d2] bg-white text-[#385038]"
                              }`}
                            >
                              <div className="font-semibold">{title}</div>
                              <div className="mt-0.5 text-[11px]">
                                {formatDate(record.createdAt)}
                              </div>
                              <div className="mt-0.5 text-[11px] text-[#5f6d5f]">
                                {record.payload.draft?.fileName?.trim() || "fichier inconnu"}
                              </div>
                            </button>
                          );
                        })}
                        {recordsForSelectedUser.length === 0 && (
                          <p className="text-xs text-[#627162]">
                            Aucune soumission pour cet utilisateur.
                          </p>
                        )}
                      </div>
                    </section>
                  </>
                )}

                <section className="rounded-lg border border-[#d7dfd2] bg-[#f8fbf6] p-4">
                  <h2 className="text-sm font-semibold text-[#2d412d]">Scan enregistré</h2>
                  <div className="mt-2 space-y-1 text-xs text-[#495849]">
                    <p>
                      <span className="font-medium">Fichier:</span> {draft?.fileName ?? "inconnu"}
                    </p>
                    <p>
                      <span className="font-medium">Source image:</span> {draft?.source ?? "?"}
                    </p>
                    <p>
                      <span className="font-medium">Sauvegardé:</span>{" "}
                      {formatDate(payload?.savedAt)}
                    </p>
                    <p>
                      <span className="font-medium">Déjà consommé:</span>{" "}
                      {payload?.platDejaConsomme ?? "non précisé"}
                    </p>
                  </div>
                  {imageUrl && (
                    <div className="mt-3 overflow-hidden rounded-md border border-[#d4dbcf] bg-white">
                      <Image
                        src={imageUrl}
                        alt="Repas scanné"
                        width={1200}
                        height={900}
                        unoptimized
                        loader={({ src }) => src}
                        className="h-52 w-full object-cover"
                      />
                    </div>
                  )}
                </section>

                <section className="rounded-lg border border-[#d7dfd2] bg-[#f8fbf6] p-4">
                  <h2 className="text-sm font-semibold text-[#2d412d]">
                    Informations facultatives
                  </h2>
                  <div className="mt-2 space-y-2 text-xs text-[#2d2d2d]">
                    <p>
                      <span className="font-medium">Nom du plat:</span>{" "}
                      {details?.dishName?.trim() || "non renseigné"}
                    </p>
                    <p>
                      <span className="font-medium">Moment du repas:</span>{" "}
                      {details?.mealMoment || "non renseigné"}
                    </p>
                    <p>
                      <span className="font-medium">Portions:</span>{" "}
                      {details?.estimatedPortions?.trim() || "non renseigné"}
                    </p>
                    <p>
                      <span className="font-medium">Ingrédients:</span>{" "}
                      {details?.ingredients?.trim() || "non renseigné"}
                    </p>
                    <p>
                      <span className="font-medium">Notes:</span>{" "}
                      {details?.notes?.trim() || "non renseigné"}
                    </p>
                  </div>
                </section>

                <section className="rounded-lg border border-[#eddab6] bg-[#fff8ea] p-4">
                  <h2 className="text-sm font-semibold text-[#7a5a18]">
                    Réponses utilisateur au coach
                  </h2>
                  <div className="mt-2 space-y-2 text-xs text-[#2d2d2d]">
                    <p>
                      <span className="font-medium">Réponse incertitudes:</span>{" "}
                      {payload?.reponseIncertitudes?.trim() || "aucune"}
                    </p>
                    <p>
                      <span className="font-medium">Réponse questions suivi:</span>{" "}
                      {payload?.reponseQuestionsSuivi?.trim() || "aucune"}
                    </p>
                  </div>
                </section>
              </aside>

              <div className="space-y-4">
                <section className="rounded-lg border border-[#d6dfd0] bg-white p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-md border border-[#dbe7d4] bg-[#f4faf0] px-3 py-2">
                      <p className="text-[11px] text-[#516451]">Score santé</p>
                      <p className="text-lg font-semibold text-[#243124]">
                        {analysis?.score_sante_100 ?? 0}/100
                      </p>
                    </div>
                    <div className="rounded-md border border-[#dbe7d4] bg-[#f4faf0] px-3 py-2">
                      <p className="text-[11px] text-[#516451]">Confiance IA</p>
                      <p className="text-lg font-semibold text-[#243124]">
                        {analysis?.confiance_100 ?? 0}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-md border border-[#d8e3d2] bg-[#f9fcf8] p-3">
                    <p className="text-[11px] text-[#516451]">Portion estimée</p>
                    <p className="mt-1 text-xs text-[#2d2d2d]">
                      {analysis?.portion_estimee?.trim() || "Non renseigné"}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-md border border-[#e1e7dc] bg-[#fbfdf9] p-3">
                      <p className="text-[11px] text-[#516451]">Calories</p>
                      <p className="text-xs font-semibold text-[#2d2d2d]">
                        {metricRangeLabel(analysis?.nutrition_estimee?.calories_kcal, "kcal")}
                      </p>
                    </div>
                    <div className="rounded-md border border-[#e1e7dc] bg-[#fbfdf9] p-3">
                      <p className="text-[11px] text-[#516451]">Protéines</p>
                      <p className="text-xs font-semibold text-[#2d2d2d]">
                        {metricRangeLabel(analysis?.nutrition_estimee?.proteines_g, "g")}
                      </p>
                    </div>
                    <div className="rounded-md border border-[#e1e7dc] bg-[#fbfdf9] p-3">
                      <p className="text-[11px] text-[#516451]">Glucides</p>
                      <p className="text-xs font-semibold text-[#2d2d2d]">
                        {metricRangeLabel(analysis?.nutrition_estimee?.glucides_g, "g")}
                      </p>
                    </div>
                    <div className="rounded-md border border-[#e1e7dc] bg-[#fbfdf9] p-3">
                      <p className="text-[11px] text-[#516451]">Lipides</p>
                      <p className="text-xs font-semibold text-[#2d2d2d]">
                        {metricRangeLabel(analysis?.nutrition_estimee?.lipides_g, "g")}
                      </p>
                    </div>
                    <div className="rounded-md border border-[#e1e7dc] bg-[#fbfdf9] p-3">
                      <p className="text-[11px] text-[#516451]">Fibres</p>
                      <p className="text-xs font-semibold text-[#2d2d2d]">
                        {metricRangeLabel(analysis?.nutrition_estimee?.fibres_g, "g")}
                      </p>
                    </div>
                  </div>
                </section>

                <div className="grid gap-4 xl:grid-cols-2">
                  <section className="rounded-lg border border-[#d8e3d2] bg-[#f9fcf7] p-4">
                    <h2 className="text-sm font-semibold text-[#2d412d]">Plats probables</h2>
                    {listOrEmpty(analysis?.plats_probables).length > 0 ? (
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[#2d2d2d]">
                        {listOrEmpty(analysis?.plats_probables).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-xs text-[#657365]">Aucun item.</p>
                    )}
                  </section>

                  <section className="rounded-lg border border-[#d8e3d2] bg-[#f9fcf7] p-4">
                    <h2 className="text-sm font-semibold text-[#2d412d]">Ingrédients visibles</h2>
                    {listOrEmpty(analysis?.ingredients_visibles).length > 0 ? (
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[#2d2d2d]">
                        {listOrEmpty(analysis?.ingredients_visibles).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-xs text-[#657365]">Aucun item.</p>
                    )}
                  </section>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <section className="rounded-lg border border-[#f0d8ad] bg-[#fff8ec] p-4">
                    <h2 className="text-sm font-semibold text-[#7a5a18]">
                      Avertissements pathologies
                    </h2>
                    {listOrEmpty(analysis?.avertissement_pathologies).length > 0 ? (
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[#2d2d2d]">
                        {listOrEmpty(analysis?.avertissement_pathologies).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-xs text-[#786b4a]">Aucun avertissement.</p>
                    )}
                  </section>

                  <section className="rounded-lg border border-[#eadfbe] bg-[#fffdf4] p-4">
                    <h2 className="text-sm font-semibold text-[#6f5d28]">Incertitudes</h2>
                    {listOrEmpty(analysis?.incertitudes).length > 0 ? (
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[#2d2d2d]">
                        {listOrEmpty(analysis?.incertitudes).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-xs text-[#786b4a]">Aucune incertitude.</p>
                    )}
                  </section>
                </div>

                <section className="rounded-lg border border-[#d8e3d2] bg-[#f9fcf7] p-4">
                  <h2 className="text-sm font-semibold text-[#2d412d]">Questions de suivi</h2>
                  {listOrEmpty(analysis?.questions_suivi).length > 0 ? (
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[#2d2d2d]">
                      {listOrEmpty(analysis?.questions_suivi).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-[#657365]">Aucune question de suivi.</p>
                  )}
                </section>

                <details className="rounded-lg border border-[#d2d8ec] bg-[#f7f9ff] p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-[#38477d]">
                    Prompt envoyé à l’IA (aperçu)
                  </summary>
                  <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-white p-3 text-[11px] text-[#2d2d2d]">
                    {payload?.promptAnalyse || "Aucun prompt enregistré dans le payload."}
                  </pre>
                </details>

                <section className="rounded-lg border border-[#d6d6d6] bg-[#fafafa] p-4">
                  <h2 className="text-sm font-semibold text-[#2d2d2d]">JSON stocké (aperçu)</h2>
                  <p className="mt-1 text-[11px] text-[#666]">
                    Les longues chaînes (ex: image base64) sont tronquées dans cet aperçu.
                  </p>
                  <pre className="mt-3 max-h-[34rem] overflow-auto rounded-md bg-[#1e2428] p-4 text-[11px] text-[#d8f2d2]">
                    {jsonPreview}
                  </pre>
                </section>
              </div>
            </div>
          </div>
        </div>
      </section>
    </HomeLayout>
  );
}
