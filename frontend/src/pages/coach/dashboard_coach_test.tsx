import { gql } from "@apollo/client/core";
import { useQuery } from "@apollo/client/react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import CoachLayout from "@/components/coach/CoachLayout";
import { UserRole, useCoachDashboardDataQuery, useProfileQuery } from "@/graphql/generated/schema";
import { getDefaultDashboardHref } from "@/lib/auth";
import type { ScannerMealDetails, ScannerMealDraft } from "@/lib/scannerDraft";

const SCANNER_COACH_PAYLOAD_KEY = "scannerMealCoachPayloadV1";
const ACTIVITY_PAGE_SIZE = 10;

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

type CoachUserMealTestRow = {
  id: string;
  userId: string;
  userEmail?: string | null;
  name: string;
  consumedAt: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  aiScore: number;
  photo: string;
  aiInsights: string[];
  coachComment: string;
  coachName: string;
};

type CoachUserMealsTestQueryData = {
  coachUserMealsTestData: CoachUserMealTestRow[];
};

type CoachSubmissionRecord = {
  id: string;
  userId: string;
  userEmail?: string | null;
  createdAt: string;
  payload: CoachSubmissionPayload;
  source: "db" | "session" | "fallback" | "error";
};

type CoachSelectableUser = {
  userId: string;
  userEmail: string;
  displayName: string;
  scannerCount: number;
  mealsCount: number;
  score: number | null;
  lastMealAt?: string | null;
};

type CoachActivityRecord = {
  id: string;
  kind: "submission" | "meal";
  occurredAt: string;
  title: string;
  subtitle: string;
  description: string;
  submission?: CoachSubmissionRecord;
  meal?: CoachUserMealTestRow;
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

const COACH_USER_MEALS_TEST_QUERY = gql`
  query CoachUserMealsTestData {
    coachUserMealsTestData {
      id
      userId
      userEmail
      name
      consumedAt
      calories
      protein
      carbs
      fat
      aiScore
      photo
      aiInsights
      coachComment
      coachName
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

function getMealHistoryTitle(meal: CoachUserMealTestRow): string {
  const name = meal.name.trim();
  return name.length > 0 ? name : `Repas ${meal.id.slice(0, 8)}`;
}

export default function DashboardCoachTestPage() {
  const router = useRouter();
  const { data: profileData, loading: profileLoading } = useProfileQuery({
    fetchPolicy: "cache-and-network",
  });
  const isAuthorizedCoach = profileData?.me?.role === UserRole.Coach;
  const {
    data: coachDashboardData,
    loading: coachUsersLoading,
    error: coachUsersError,
    refetch: refetchCoachUsers,
  } = useCoachDashboardDataQuery({
    fetchPolicy: "cache-and-network",
    skip: !isAuthorizedCoach,
  });
  const {
    data,
    loading,
    error,
    refetch: refetchScannerSubmissions,
  } = useQuery<CoachScannerSubmissionsTestQueryData>(COACH_SCANNER_SUBMISSIONS_TEST_QUERY, {
    fetchPolicy: "cache-and-network",
    skip: !isAuthorizedCoach,
  });
  const {
    data: mealsData,
    loading: mealsLoading,
    error: mealsError,
    refetch: refetchCoachMeals,
  } = useQuery<CoachUserMealsTestQueryData>(COACH_USER_MEALS_TEST_QUERY, {
    fetchPolicy: "cache-and-network",
    skip: !isAuthorizedCoach,
  });
  const [localPayload, setLocalPayload] = useState<CoachSubmissionPayload | null>(null);
  const [localSourceLabel, setLocalSourceLabel] = useState<"session" | "fallback" | "error">(
    "fallback",
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [selectedMealHistoryId, setSelectedMealHistoryId] = useState<string | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [activityPage, setActivityPage] = useState(0);
  const deferredUserSearchTerm = useDeferredValue(userSearchTerm);

  const handleSelectUser = useCallback((nextUserId: string | null) => {
    setSelectedUserId(nextUserId);
    setSelectedSubmissionId(null);
    setSelectedMealHistoryId(null);
    setActivityPage(0);
  }, []);

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
      .map((row): CoachSubmissionRecord | null => {
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
      .filter((row): row is CoachSubmissionRecord => row !== null);
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

  const coachMealRows = useMemo(() => {
    return (mealsData?.coachUserMealsTestData ?? []).slice().sort((a, b) => {
      return new Date(b.consumedAt).getTime() - new Date(a.consumedAt).getTime();
    });
  }, [mealsData?.coachUserMealsTestData]);
  const coachedUsers = coachDashboardData?.coachDashboardData?.coachedUsers ?? [];
  const recentUsers = coachDashboardData?.coachDashboardData?.recentUsers ?? [];

  const hasDbRecords = dbRecords.length > 0;
  const hasMealHistoryRows = coachMealRows.length > 0;
  const hasAnyDbData = hasDbRecords || hasMealHistoryRows;

  const users = useMemo<CoachSelectableUser[]>(() => {
    const map = new Map<string, CoachSelectableUser>();

    for (const coachedUser of coachedUsers) {
      const userEmail = coachedUser.email?.trim() || `Utilisateur ${coachedUser.id.slice(0, 8)}`;
      const displayName = coachedUser.name?.trim() || userEmail;

      map.set(coachedUser.id, {
        userId: coachedUser.id,
        userEmail,
        displayName,
        scannerCount: 0,
        mealsCount: 0,
        score: coachedUser.score,
        lastMealAt: coachedUser.lastMealAt ?? null,
      });
    }

    for (const record of dbRecords) {
      const existing = map.get(record.userId);
      const userEmail = record.userEmail?.trim() || `Utilisateur ${record.userId.slice(0, 8)}`;
      if (existing) {
        existing.scannerCount += 1;
      } else {
        map.set(record.userId, {
          userId: record.userId,
          userEmail,
          displayName: userEmail,
          scannerCount: 1,
          mealsCount: 0,
          score: null,
          lastMealAt: null,
        });
      }
    }

    for (const mealRow of coachMealRows) {
      const existing = map.get(mealRow.userId);
      const userEmail = mealRow.userEmail?.trim() || `Utilisateur ${mealRow.userId.slice(0, 8)}`;
      if (existing) {
        existing.mealsCount += 1;
      } else {
        map.set(mealRow.userId, {
          userId: mealRow.userId,
          userEmail,
          displayName: userEmail,
          scannerCount: 0,
          mealsCount: 1,
          score: mealRow.aiScore,
          lastMealAt: mealRow.consumedAt,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      const byName = a.displayName.localeCompare(b.displayName, "fr", {
        sensitivity: "base",
      });
      if (byName !== 0) {
        return byName;
      }

      return a.userEmail.localeCompare(b.userEmail, "fr", {
        sensitivity: "base",
      });
    });
  }, [coachMealRows, coachedUsers, dbRecords]);

  const normalizedUserSearch = deferredUserSearchTerm.trim().toLowerCase();
  const filteredUsers = useMemo(() => {
    if (!normalizedUserSearch) {
      return users;
    }

    return users.filter((user) => {
      const haystack = `${user.displayName} ${user.userEmail}`.toLowerCase();
      return haystack.includes(normalizedUserSearch);
    });
  }, [normalizedUserSearch, users]);

  useEffect(() => {
    if (users.length === 0) {
      setSelectedUserId(null);
      setSelectedSubmissionId(null);
      setSelectedMealHistoryId(null);
      return;
    }

    const preferredUserId =
      coachMealRows[0]?.userId ??
      dbRecords[0]?.userId ??
      recentUsers[0]?.id ??
      users[0]?.userId ??
      null;

    setSelectedUserId((current) => {
      if (current && users.some((user) => user.userId === current)) {
        return current;
      }

      return preferredUserId;
    });
  }, [coachMealRows, dbRecords, recentUsers, users]);

  const recordsForSelectedUser = useMemo(() => {
    if (!hasDbRecords || !selectedUserId) {
      return [];
    }

    return dbRecords.filter((record) => record.userId === selectedUserId);
  }, [dbRecords, hasDbRecords, selectedUserId]);

  const mealHistoryForSelectedUser = useMemo(() => {
    if (!selectedUserId) {
      return [];
    }

    return coachMealRows.filter((record) => record.userId === selectedUserId);
  }, [coachMealRows, selectedUserId]);

  useEffect(() => {
    const hasSelectedSubmission =
      selectedSubmissionId !== null &&
      recordsForSelectedUser.some((record) => record.id === selectedSubmissionId);
    const hasSelectedMeal =
      selectedMealHistoryId !== null &&
      mealHistoryForSelectedUser.some((meal) => meal.id === selectedMealHistoryId);

    if (hasSelectedSubmission || hasSelectedMeal) {
      return;
    }

    const latestSubmission = recordsForSelectedUser[0];
    const latestMeal = mealHistoryForSelectedUser[0];

    if (latestMeal) {
      setSelectedMealHistoryId(latestMeal.id);
      setSelectedSubmissionId(null);
      return;
    }

    if (latestSubmission) {
      setSelectedSubmissionId(latestSubmission.id);
      setSelectedMealHistoryId(null);
      return;
    }

    setSelectedSubmissionId(null);
    setSelectedMealHistoryId(null);
  }, [
    mealHistoryForSelectedUser,
    recordsForSelectedUser,
    selectedMealHistoryId,
    selectedSubmissionId,
  ]);

  const selectedUser = useMemo(() => {
    return users.find((user) => user.userId === selectedUserId) ?? users[0] ?? null;
  }, [selectedUserId, users]);
  const selectedUserIndex = selectedUser
    ? users.findIndex((user) => user.userId === selectedUser.userId)
    : -1;
  const shouldUseLocalPreview = !hasAnyDbData && users.length === 0;
  const selectedRecord = useMemo(() => {
    if (selectedSubmissionId) {
      return recordsForSelectedUser.find((record) => record.id === selectedSubmissionId) ?? null;
    }

    if (!selectedUserId && hasDbRecords && !selectedMealHistoryId) {
      return dbRecords.find((record) => record.id === selectedSubmissionId) ?? dbRecords[0] ?? null;
    }

    return shouldUseLocalPreview ? localRecord : null;
  }, [
    dbRecords,
    hasDbRecords,
    localRecord,
    recordsForSelectedUser,
    selectedMealHistoryId,
    selectedSubmissionId,
    selectedUserId,
    shouldUseLocalPreview,
  ]);

  const payload =
    selectedRecord?.payload ?? (shouldUseLocalPreview ? (localRecord?.payload ?? null) : null);
  const jsonPreview = useMemo(() => {
    if (!payload) {
      return null;
    }

    return JSON.stringify(truncateDeep(payload), null, 2);
  }, [payload]);
  const selectedMealHistory = useMemo(() => {
    if (!selectedMealHistoryId) {
      return null;
    }

    return mealHistoryForSelectedUser.find((meal) => meal.id === selectedMealHistoryId) ?? null;
  }, [mealHistoryForSelectedUser, selectedMealHistoryId]);
  const activitiesForSelectedUser = useMemo<CoachActivityRecord[]>(() => {
    const submissionActivities = recordsForSelectedUser.map((record) => ({
      id: `submission-${record.id}`,
      kind: "submission" as const,
      occurredAt: record.createdAt,
      title: getSubmissionTitle(record.payload, record.id),
      subtitle: "Soumission envoyée au coach",
      description: record.payload.draft?.fileName?.trim() || "Fichier inconnu",
      submission: record,
    }));
    const mealActivities = mealHistoryForSelectedUser.map((meal) => ({
      id: `meal-${meal.id}`,
      kind: "meal" as const,
      occurredAt: meal.consumedAt,
      title: getMealHistoryTitle(meal),
      subtitle: "Scan enregistré en base",
      description: `${meal.calories} kcal • score ${meal.aiScore}/100`,
      meal,
    }));

    return [...submissionActivities, ...mealActivities].sort((a, b) => {
      return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime();
    });
  }, [mealHistoryForSelectedUser, recordsForSelectedUser]);
  const activityPageCount = Math.max(
    1,
    Math.ceil(activitiesForSelectedUser.length / ACTIVITY_PAGE_SIZE),
  );
  const paginatedActivitiesForSelectedUser = useMemo(() => {
    const startIndex = activityPage * ACTIVITY_PAGE_SIZE;
    return activitiesForSelectedUser.slice(startIndex, startIndex + ACTIVITY_PAGE_SIZE);
  }, [activitiesForSelectedUser, activityPage]);
  const selectedActivityId = selectedSubmissionId
    ? `submission-${selectedSubmissionId}`
    : selectedMealHistoryId
      ? `meal-${selectedMealHistoryId}`
      : null;
  const selectedActivity = useMemo(() => {
    if (!selectedActivityId) {
      return null;
    }

    return activitiesForSelectedUser.find((activity) => activity.id === selectedActivityId) ?? null;
  }, [activitiesForSelectedUser, selectedActivityId]);
  useEffect(() => {
    setActivityPage((currentPage) => Math.min(currentPage, activityPageCount - 1));
  }, [activityPageCount]);

  const analysis = payload?.analysis;
  const details = payload?.details;
  const draft = payload?.draft;
  const imageUrl = draft?.imageUrl?.trim();
  const hasPreviousUser = selectedUserIndex > 0;
  const hasNextUser = selectedUserIndex >= 0 && selectedUserIndex < users.length - 1;

  useEffect(() => {
    if (!profileLoading) {
      if (!profileData?.me) {
        void router.replace({
          pathname: "/coach/login",
          query: { returnUrl: router.asPath },
        });
      } else if (profileData.me.role !== UserRole.Coach) {
        void router.replace(getDefaultDashboardHref(profileData.me.role));
      }
    }
  }, [profileData, profileLoading, router]);

  if (profileLoading) {
    return (
      <CoachLayout pageTitle="Dashboard Coach Test">
        <div className="flex min-h-[400px] flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </CoachLayout>
    );
  }

  if (!profileData?.me || profileData.me.role !== UserRole.Coach) {
    return null;
  }

  return (
    <CoachLayout pageTitle="Dashboard Coach Test" footerVariant="userSlim">
      <section className="flex flex-1 bg-[#eef3ea] px-4 py-6 md:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="rounded-xl border border-[#cfd8c8] bg-white p-5 shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-xl font-semibold text-[#243124]">Dashboard Coach Test</h1>
                <p className="mt-1 text-xs text-[#596659]">
                  Visualisation chronologique des derniers scans d’un coaché.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    loadPayload();
                    void refetchScannerSubmissions();
                    void refetchCoachMeals();
                    void refetchCoachUsers();
                  }}
                  className="rounded-md bg-[#2f5f8f] px-3 py-2 text-xs font-semibold text-white"
                >
                  {loading || mealsLoading || coachUsersLoading ? "Chargement..." : "Rafraîchir"}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-3 rounded-md border border-[#efc9c9] bg-[#fff3f3] px-3 py-2 text-xs text-[#8d3333]">
                Impossible de charger les soumissions depuis la base. Affichage local/fallback.
              </div>
            )}
            {mealsError && (
              <div className="mt-3 rounded-md border border-[#efc9c9] bg-[#fff3f3] px-3 py-2 text-xs text-[#8d3333]">
                Impossible de charger les repas existants (DB). La section des repas historiques
                peut être incomplète.
              </div>
            )}
            {coachUsersError && (
              <div className="mt-3 rounded-md border border-[#efddbf] bg-[#fff9ef] px-3 py-2 text-xs text-[#8a5f11]">
                Impossible de charger la liste complète des coachés. Les utilisateurs affichés
                viennent seulement des scans et repas déjà visibles.
              </div>
            )}

            {loadError && (
              <div className="mt-3 rounded-md border border-[#efc9c9] bg-[#fff3f3] px-3 py-2 text-xs text-[#8d3333]">
                {loadError}
              </div>
            )}

            <section className="mt-5 rounded-lg border border-[#d9e5d0] bg-[#f7fbf3] p-4">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
                <div>
                  <h2 className="text-sm font-semibold text-[#243124]">Coaché sélectionné</h2>
                  <p className="mt-1 text-xs text-[#5a6758]">
                    {selectedUser
                      ? `${selectedUser.userEmail}${
                          selectedUser.displayName !== selectedUser.userEmail
                            ? ` • ${selectedUser.displayName}`
                            : ""
                        }`
                      : coachUsersLoading
                        ? "Chargement de la liste des coachés..."
                        : "Aucun coaché rattaché à ce coach pour le moment."}
                  </p>
                  {selectedUser && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-md border border-[#d8e5d2] bg-white px-3 py-2">
                        <p className="text-[11px] text-[#5a6758]">Score</p>
                        <p className="text-sm font-semibold text-[#243124]">
                          {selectedUser.score !== null ? Math.round(selectedUser.score) : "--"}
                        </p>
                      </div>
                      <div className="rounded-md border border-[#d8e5d2] bg-white px-3 py-2">
                        <p className="text-[11px] text-[#5a6758]">Scans envoyés</p>
                        <p className="text-sm font-semibold text-[#243124]">
                          {selectedUser.scannerCount}
                        </p>
                      </div>
                      <div className="rounded-md border border-[#d8e5d2] bg-white px-3 py-2">
                        <p className="text-[11px] text-[#5a6758]">Repas DB</p>
                        <p className="text-sm font-semibold text-[#243124]">
                          {selectedUser.mealsCount}
                        </p>
                      </div>
                      <div className="rounded-md border border-[#d8e5d2] bg-white px-3 py-2">
                        <p className="text-[11px] text-[#5a6758]">Dernier envoi</p>
                        <p className="text-xs font-semibold text-[#243124]">
                          {selectedUser.lastMealAt ? formatDate(selectedUser.lastMealAt) : "Aucun"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-md border border-[#d8e5d2] bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#556652]">
                    Navigation coachés
                  </p>
                  <p className="mt-1 text-xs text-[#5a6758]">
                    {selectedUserIndex >= 0
                      ? `Coaché ${selectedUserIndex + 1} sur ${users.length}`
                      : "Aucun coaché sélectionné"}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectUser(users[selectedUserIndex - 1]?.userId ?? null)}
                      disabled={!hasPreviousUser}
                      className="rounded-md border border-[#cfd8c8] bg-[#f6faf3] px-3 py-2 text-xs font-semibold text-[#355335] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Coaché précédent
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectUser(users[selectedUserIndex + 1]?.userId ?? null)}
                      disabled={!hasNextUser}
                      className="rounded-md border border-[#cfd8c8] bg-[#f6faf3] px-3 py-2 text-xs font-semibold text-[#355335] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Coaché suivant
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(220px,0.7fr)_minmax(220px,0.7fr)]">
                <section className="rounded-md border border-[#d8e5d2] bg-white p-4 xl:row-span-2">
                  <div>
                    <h3 className="text-sm font-semibold text-[#243124]">Coachés</h3>
                    <p className="mt-1 text-xs text-[#5a6758]">
                      {users.length} coaché{users.length > 1 ? "s" : ""} rattaché
                      {users.length > 1 ? "s" : ""} à ce coach.
                    </p>
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="coach-user-search"
                      className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#556c97]"
                    >
                      Choisir un coaché
                    </label>
                    <p className="mt-1 text-[11px] text-[#5f6d97]">
                      Recherche un nom ou un email, puis sélectionne le coaché dans la liste.
                    </p>
                    <input
                      id="coach-user-search"
                      type="search"
                      value={userSearchTerm}
                      onChange={(event) => {
                        setUserSearchTerm(event.target.value);
                      }}
                      placeholder="Nom ou email"
                      className="mt-2 w-full rounded-md border border-[#d5dcf0] bg-white px-3 py-2 text-sm text-[#23386f] outline-none transition focus:border-[#6986d8] focus:ring-2 focus:ring-[#e1e8ff]"
                    />
                    <select
                      value={selectedUserId ?? ""}
                      onChange={(event) => handleSelectUser(event.target.value || null)}
                      className="mt-3 w-full rounded-md border border-[#d5dcf0] bg-white px-3 py-2 text-sm text-[#23386f] outline-none transition focus:border-[#6986d8] focus:ring-2 focus:ring-[#e1e8ff]"
                    >
                      <option value="">Sélectionner un coaché</option>
                      {filteredUsers.map((user) => (
                        <option key={user.userId} value={user.userId}>
                          {user.userEmail}
                          {user.displayName !== user.userEmail ? ` - ${user.displayName}` : ""}
                        </option>
                      ))}
                    </select>
                    {selectedUser && (
                      <div className="mt-3 rounded-md border border-[#dce6f9] bg-[#f8fbff] px-3 py-2 text-xs text-[#34507e]">
                        <p className="font-semibold">{selectedUser.userEmail}</p>
                        {selectedUser.displayName !== selectedUser.userEmail && (
                          <p className="mt-0.5">Profil: {selectedUser.displayName}</p>
                        )}
                        <p className="mt-1">
                          {selectedUser.scannerCount} soumission
                          {selectedUser.scannerCount > 1 ? "s" : ""} scanner •{" "}
                          {selectedUser.mealsCount} repas DB
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#58719b]">
                          {selectedUser.lastMealAt
                            ? `Dernière activité: ${formatDate(selectedUser.lastMealAt)}`
                            : "Aucune activité récente"}
                        </p>
                      </div>
                    )}
                    {filteredUsers.length === 0 && (
                      <p className="mt-3 text-xs text-[#62719c]">
                        Aucun coaché ne correspond à cette recherche.
                      </p>
                    )}
                  </div>
                </section>

                <div className="rounded-md border border-[#d8e5d2] bg-white px-3 py-3">
                  <p className="text-[11px] text-[#5a6758]">Soumissions scanner</p>
                  <p className="text-base font-semibold text-[#243124]">
                    {selectedUser?.scannerCount ?? 0}
                  </p>
                </div>
                <div className="rounded-md border border-[#d8e5d2] bg-white px-3 py-3">
                  <p className="text-[11px] text-[#5a6758]">Repas historiques</p>
                  <p className="text-base font-semibold text-[#243124]">
                    {selectedUser?.mealsCount ?? 0}
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-5 grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
              <aside className="flex flex-col gap-4">
                {users.length > 0 && (
                  <section className="order-1 rounded-lg border border-[#d5ead8] bg-[#f7fcf8] p-4">
                    <h2 className="text-sm font-semibold text-[#2c5c38]">
                      Derniers scans du coaché
                    </h2>
                    <p className="mt-1 text-[11px] text-[#5d7b63]">
                      10 éléments par page. Utilise `Suivant` pour charger les activités plus
                      anciennes du coaché sélectionné.
                    </p>
                    <div className="mt-3 space-y-2">
                      {paginatedActivitiesForSelectedUser.map((activity) => {
                        const isActive = activity.id === selectedActivity?.id;

                        return (
                          <button
                            key={activity.id}
                            type="button"
                            onClick={() => {
                              if (activity.kind === "submission" && activity.submission) {
                                setSelectedSubmissionId(activity.submission.id);
                                setSelectedMealHistoryId(null);
                                return;
                              }

                              if (activity.kind === "meal" && activity.meal) {
                                setSelectedMealHistoryId(activity.meal.id);
                                setSelectedSubmissionId(null);
                              }
                            }}
                            className={`w-full rounded-md border px-3 py-2 text-left text-xs ${
                              isActive
                                ? "border-[#6cb07a] bg-[#ebf9ee] text-[#23492c]"
                                : "border-[#d5ead8] bg-white text-[#35523b]"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-semibold">{activity.title}</div>
                                <div className="mt-0.5 text-[11px]">
                                  {formatDate(activity.occurredAt)}
                                </div>
                                <div className="mt-0.5 text-[11px] text-[#5d7b63]">
                                  {activity.description}
                                </div>
                              </div>
                              <span
                                className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                                  activity.kind === "submission"
                                    ? "bg-[#edf4ff] text-[#3a5ba8]"
                                    : "bg-[#eaf7ee] text-[#27663a]"
                                }`}
                              >
                                {activity.subtitle}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                      {paginatedActivitiesForSelectedUser.length === 0 && (
                        <p className="text-xs text-[#627162]">
                          Aucun scan ni repas historique pour cet utilisateur.
                        </p>
                      )}
                    </div>
                    {activitiesForSelectedUser.length > 0 && (
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <p className="text-[11px] text-[#5d7b63]">
                          Page {activityPage + 1} sur {activityPageCount}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActivityPage((current) => Math.max(current - 1, 0))}
                            disabled={activityPage === 0}
                            className="rounded-md border border-[#cfe2d4] bg-white px-3 py-2 text-xs font-semibold text-[#35523b] disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            Précédent
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setActivityPage((current) =>
                                Math.min(current + 1, activityPageCount - 1),
                              )
                            }
                            disabled={activityPage >= activityPageCount - 1}
                            className="rounded-md border border-[#cfe2d4] bg-white px-3 py-2 text-xs font-semibold text-[#35523b] disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            Suivant
                          </button>
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {payload ? (
                  <>
                    <section className="order-2 rounded-lg border border-[#d7dfd2] bg-[#f8fbf6] p-4">
                      <h2 className="text-sm font-semibold text-[#2d412d]">Scan enregistré</h2>
                      <div className="mt-2 space-y-1 text-xs text-[#495849]">
                        <p>
                          <span className="font-medium">Fichier:</span>{" "}
                          {draft?.fileName ?? "inconnu"}
                        </p>
                        <p>
                          <span className="font-medium">Source image:</span> {draft?.source ?? "?"}
                        </p>
                        <p>
                          <span className="font-medium">Sauvegardé:</span>{" "}
                          {formatDate(payload.savedAt)}
                        </p>
                        <p>
                          <span className="font-medium">Déjà consommé:</span>{" "}
                          {payload.platDejaConsomme ?? "non précisé"}
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

                    <section className="order-4 rounded-lg border border-[#d7dfd2] bg-[#f8fbf6] p-4">
                      <h2 className="text-sm font-semibold text-[#2d412d]">
                        Informations facultatives
                      </h2>
                      <div className="mt-2 space-y-2 text-xs text-dark-header">
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

                    <section className="order-5 rounded-lg border border-[#eddab6] bg-[#fff8ea] p-4">
                      <h2 className="text-sm font-semibold text-[#7a5a18]">
                        Réponses utilisateur au coach
                      </h2>
                      <div className="mt-2 space-y-2 text-xs text-dark-header">
                        <p>
                          <span className="font-medium">Réponse incertitudes:</span>{" "}
                          {payload.reponseIncertitudes?.trim() || "aucune"}
                        </p>
                        <p>
                          <span className="font-medium">Réponse questions suivi:</span>{" "}
                          {payload.reponseQuestionsSuivi?.trim() || "aucune"}
                        </p>
                      </div>
                    </section>
                  </>
                ) : (
                  <section className="order-2 rounded-lg border border-[#e6ddc1] bg-[#fffaf0] p-4">
                    <h2 className="text-sm font-semibold text-[#75561e]">
                      Aucune soumission scanner
                    </h2>
                    <p className="mt-2 text-xs text-[#7a6843]">
                      {selectedUser
                        ? selectedMealHistory
                          ? "Ce coaché n'a pas de soumission coach, mais un scan DB récent est bien disponible."
                          : "Ce coaché n'a pas encore envoyé de scan exploitable au coach."
                        : "Sélectionnez un coaché pour afficher ses scans et ses repas."}
                    </p>
                  </section>
                )}
              </aside>

              <div className="space-y-4">
                {payload ? (
                  <>
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
                        <p className="mt-1 text-xs text-dark-header">
                          {analysis?.portion_estimee?.trim() || "Non renseigné"}
                        </p>
                      </div>

                      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-md border border-[#e1e7dc] bg-[#fbfdf9] p-3">
                          <p className="text-[11px] text-[#516451]">Calories</p>
                          <p className="text-xs font-semibold text-dark-header">
                            {metricRangeLabel(analysis?.nutrition_estimee?.calories_kcal, "kcal")}
                          </p>
                        </div>
                        <div className="rounded-md border border-[#e1e7dc] bg-[#fbfdf9] p-3">
                          <p className="text-[11px] text-[#516451]">Protéines</p>
                          <p className="text-xs font-semibold text-dark-header">
                            {metricRangeLabel(analysis?.nutrition_estimee?.proteines_g, "g")}
                          </p>
                        </div>
                        <div className="rounded-md border border-[#e1e7dc] bg-[#fbfdf9] p-3">
                          <p className="text-[11px] text-[#516451]">Glucides</p>
                          <p className="text-xs font-semibold text-dark-header">
                            {metricRangeLabel(analysis?.nutrition_estimee?.glucides_g, "g")}
                          </p>
                        </div>
                        <div className="rounded-md border border-[#e1e7dc] bg-[#fbfdf9] p-3">
                          <p className="text-[11px] text-[#516451]">Lipides</p>
                          <p className="text-xs font-semibold text-dark-header">
                            {metricRangeLabel(analysis?.nutrition_estimee?.lipides_g, "g")}
                          </p>
                        </div>
                        <div className="rounded-md border border-[#e1e7dc] bg-[#fbfdf9] p-3">
                          <p className="text-[11px] text-[#516451]">Fibres</p>
                          <p className="text-xs font-semibold text-dark-header">
                            {metricRangeLabel(analysis?.nutrition_estimee?.fibres_g, "g")}
                          </p>
                        </div>
                      </div>
                    </section>

                    <div className="grid gap-4 xl:grid-cols-2">
                      <section className="rounded-lg border border-[#d8e3d2] bg-[#f9fcf7] p-4">
                        <h2 className="text-sm font-semibold text-[#2d412d]">Plats probables</h2>
                        {listOrEmpty(analysis?.plats_probables).length > 0 ? (
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-dark-header">
                            {listOrEmpty(analysis?.plats_probables).map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-xs text-[#657365]">Aucun item.</p>
                        )}
                      </section>

                      <section className="rounded-lg border border-[#d8e3d2] bg-[#f9fcf7] p-4">
                        <h2 className="text-sm font-semibold text-[#2d412d]">
                          Ingrédients visibles
                        </h2>
                        {listOrEmpty(analysis?.ingredients_visibles).length > 0 ? (
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-dark-header">
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
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-dark-header">
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
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-dark-header">
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
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-dark-header">
                          {listOrEmpty(analysis?.questions_suivi).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs text-[#657365]">Aucune question de suivi.</p>
                      )}
                    </section>
                  </>
                ) : selectedMealHistory ? (
                  <section className="rounded-lg border border-[#d5ead8] bg-[#f7fcf8] p-4">
                    <h2 className="text-sm font-semibold text-[#2c5c38]">
                      Aucun envoi coach, mais scan DB détecté
                    </h2>
                    <p className="mt-2 text-xs text-[#4e6d56]">
                      Le coaché sélectionné n’a pas envoyé de soumission dédiée au coach, mais ce
                      scan a bien été trouvé dans les tables `meal` / `dish`.
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                      <div className="overflow-hidden rounded-md border border-[#d5ead8] bg-white">
                        <Image
                          src={selectedMealHistory.photo}
                          alt={getMealHistoryTitle(selectedMealHistory)}
                          width={800}
                          height={600}
                          unoptimized
                          loader={({ src }) => src}
                          className="h-36 w-full object-cover"
                        />
                      </div>
                      <div className="rounded-md border border-[#d5ead8] bg-white p-3 text-xs text-dark-header">
                        <p>
                          <span className="font-medium">Repas:</span>{" "}
                          {getMealHistoryTitle(selectedMealHistory)}
                        </p>
                        <p>
                          <span className="font-medium">Date:</span>{" "}
                          {formatDate(selectedMealHistory.consumedAt)}
                        </p>
                        <p>
                          <span className="font-medium">Utilisateur:</span>{" "}
                          {selectedMealHistory.userEmail || selectedMealHistory.userId}
                        </p>
                        <p>
                          <span className="font-medium">Calories:</span>{" "}
                          {selectedMealHistory.calories} kcal
                        </p>
                        <p>
                          <span className="font-medium">Score IA:</span>{" "}
                          {selectedMealHistory.aiScore}/100
                        </p>
                      </div>
                    </div>
                  </section>
                ) : (
                  <section className="rounded-lg border border-[#e6ddc1] bg-[#fffaf0] p-4">
                    <h2 className="text-sm font-semibold text-[#75561e]">
                      Aucune analyse scanner disponible
                    </h2>
                    <p className="mt-2 text-xs text-[#7a6843]">
                      {selectedUser
                        ? "Le coaché sélectionné n'a encore aucune soumission scanner à afficher ici."
                        : "Choisissez un coaché dans la liste pour afficher son analyse."}
                    </p>
                  </section>
                )}

                <section className="rounded-lg border border-[#d5ead8] bg-[#f7fcf8] p-4">
                  <h2 className="text-sm font-semibold text-[#2c5c38]">
                    Détail repas DB sélectionné (historique existant)
                  </h2>
                  {selectedMealHistory ? (
                    <div className="mt-3 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)]">
                        <div className="overflow-hidden rounded-md border border-[#d5ead8] bg-white">
                          <Image
                            src={selectedMealHistory.photo}
                            alt={getMealHistoryTitle(selectedMealHistory)}
                            width={800}
                            height={600}
                            unoptimized
                            loader={({ src }) => src}
                            className="h-32 w-full object-cover"
                          />
                        </div>
                        <div className="rounded-md border border-[#d5ead8] bg-white p-3 text-xs text-dark-header">
                          <p>
                            <span className="font-medium">Utilisateur:</span>{" "}
                            {selectedMealHistory.userEmail || selectedMealHistory.userId}
                          </p>
                          <p>
                            <span className="font-medium">Repas:</span>{" "}
                            {getMealHistoryTitle(selectedMealHistory)}
                          </p>
                          <p>
                            <span className="font-medium">Date:</span>{" "}
                            {formatDate(selectedMealHistory.consumedAt)}
                          </p>
                          <p>
                            <span className="font-medium">Coach:</span>{" "}
                            {selectedMealHistory.coachName}
                          </p>
                          <p className="mt-1">
                            <span className="font-medium">Commentaire coach:</span>{" "}
                            {selectedMealHistory.coachComment}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-5">
                        <div className="rounded-md border border-[#dbe7d4] bg-white p-3 text-xs">
                          <p className="text-[11px] text-[#516451]">Calories</p>
                          <p className="font-semibold text-[#243124]">
                            {selectedMealHistory.calories} kcal
                          </p>
                        </div>
                        <div className="rounded-md border border-[#dbe7d4] bg-white p-3 text-xs">
                          <p className="text-[11px] text-[#516451]">Protéines</p>
                          <p className="font-semibold text-[#243124]">
                            {selectedMealHistory.protein} g
                          </p>
                        </div>
                        <div className="rounded-md border border-[#dbe7d4] bg-white p-3 text-xs">
                          <p className="text-[11px] text-[#516451]">Glucides</p>
                          <p className="font-semibold text-[#243124]">
                            {selectedMealHistory.carbs} g
                          </p>
                        </div>
                        <div className="rounded-md border border-[#dbe7d4] bg-white p-3 text-xs">
                          <p className="text-[11px] text-[#516451]">Lipides</p>
                          <p className="font-semibold text-[#243124]">
                            {selectedMealHistory.fat} g
                          </p>
                        </div>
                        <div className="rounded-md border border-[#dbe7d4] bg-white p-3 text-xs">
                          <p className="text-[11px] text-[#516451]">Score IA</p>
                          <p className="font-semibold text-[#243124]">
                            {selectedMealHistory.aiScore}/100
                          </p>
                        </div>
                      </div>

                      <div className="rounded-md border border-[#d5ead8] bg-white p-3">
                        <p className="text-[11px] font-semibold text-[#3f6448]">
                          Insights IA (historique)
                        </p>
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-dark-header">
                          {selectedMealHistory.aiInsights.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-[#627162]">
                      Aucun repas DB sélectionné pour cet utilisateur.
                    </p>
                  )}
                </section>

                {payload && (
                  <>
                    <details className="rounded-lg border border-[#d2d8ec] bg-[#f7f9ff] p-4">
                      <summary className="cursor-pointer text-sm font-semibold text-[#38477d]">
                        Prompt envoyé à l’IA (aperçu)
                      </summary>
                      <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-white p-3 text-[11px] text-dark-header">
                        {payload.promptAnalyse || "Aucun prompt enregistré dans le payload."}
                      </pre>
                    </details>

                    <section className="rounded-lg border border-[#d6d6d6] bg-[#fafafa] p-4">
                      <h2 className="text-sm font-semibold text-dark-header">
                        JSON stocké (aperçu)
                      </h2>
                      <p className="mt-1 text-[11px] text-[#666]">
                        Les longues chaînes (ex: image base64) sont tronquées dans cet aperçu.
                      </p>
                      <pre className="mt-3 max-h-136 overflow-auto rounded-md bg-[#1e2428] p-4 text-[11px] text-[#d8f2d2]">
                        {jsonPreview}
                      </pre>
                    </section>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </CoachLayout>
  );
}
