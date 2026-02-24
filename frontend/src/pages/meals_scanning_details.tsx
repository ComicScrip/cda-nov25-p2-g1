import { gql } from "@apollo/client/core";
import { useMutation, useQuery } from "@apollo/client/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import HomeLayout from "@/components/HomeLayout";
import UserPageLayout from "@/components/UserPageLayout";
import {
  type ImageSource,
  SCANNER_ANALYSIS_REQUEST_KEY,
  SCANNER_ANALYSIS_RESPONSE_KEY,
  SCANNER_MEAL_DRAFT_KEY,
  type ScannerAnalysisRequest,
  type ScannerMealDetails,
  type ScannerMealDraft,
} from "@/lib/scannerDraft";

const DEFAULT_DETAILS: ScannerMealDetails = {
  dishName: "",
  mealMoment: "",
  estimatedPortions: "",
  ingredients: "",
  notes: "",
};

const SOURCE_LABELS: Record<ImageSource, string> = {
  fichier: "Fichier",
  collage: "Collage",
  url: "URL",
  camera: "Caméra",
};

type NutritionRange = {
  min: number;
  max: number;
};

type ScannerMockAnalysisResponse = {
  plats_probables: string[];
  ingredients_visibles: string[];
  portion_estimee: string;
  nutrition_estimee: {
    calories_kcal: NutritionRange;
    proteines_g: NutritionRange;
    glucides_g: NutritionRange;
    lipides_g: NutritionRange;
    fibres_g: NutritionRange;
  };
  score_sante_100: number;
  confiance_100: number;
  incertitudes: string[];
  questions_suivi: string[];
  avertissement_pathologies: string[];
};

type NutritionMetricKey = keyof ScannerMockAnalysisResponse["nutrition_estimee"];
type EditableListSection = "plats_probables" | "ingredients_visibles";

type UserProfilePromptPayload = {
  dateOfBirth?: string | null;
  gender?: string | null;
  height?: number | null;
  currentWeight?: number | null;
  medicalTags?: string[] | null;
};

type UserProfilePromptQueryData = {
  userProfileData: UserProfilePromptPayload | null;
};

type SaveScannerCoachSubmissionMutationData = {
  saveScannerCoachSubmission: boolean;
};

type SaveScannerCoachSubmissionMutationVariables = {
  payloadJson: string;
};

const USER_PROFILE_PROMPT_QUERY = gql`
  query UserProfilePromptData {
    userProfileData {
      dateOfBirth
      gender
      height
      currentWeight
      medicalTags
    }
  }
`;

const SAVE_SCANNER_COACH_SUBMISSION_MUTATION = gql`
  mutation SaveScannerCoachSubmission($payloadJson: String!) {
    saveScannerCoachSubmission(payloadJson: $payloadJson)
  }
`;

const NUTRITION_METRICS: Array<{ key: NutritionMetricKey; label: string; unit: string }> = [
  { key: "calories_kcal", label: "Calories", unit: "kcal" },
  { key: "proteines_g", label: "Protéines", unit: "g" },
  { key: "glucides_g", label: "Glucides", unit: "g" },
  { key: "lipides_g", label: "Lipides", unit: "g" },
  { key: "fibres_g", label: "Fibres", unit: "g" },
];

const SCANNER_COACH_PAYLOAD_KEY = "scannerMealCoachPayloadV1";
const MOCK_ANALYSIS_DELAY_MS = 10_000;
const MOCK_TRIGGER_FILE_NAME = "patebolo.jpg";
const MOCK_HUMAN_FILE_NAME = "humain.png";

const MOCK_ANALYSIS_RESPONSE: ScannerMockAnalysisResponse = {
  plats_probables: ["Spaghetti (ou pâtes longues) type bolognaise avec légumes en dés"],
  ingredients_visibles: [
    "pâtes longues (type spaghetti)",
    "sauce tomate avec morceaux de tomate",
    "viande hachée (probable)",
    "courgette en dés",
    "carotte en dés",
  ],
  portion_estimee:
    "Moyenne à grande (bol presque plein) ~350–450 g au total (pâtes cuites ~200–280 g + sauce/viande/légumes ~150–200 g).",
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
    "Type de viande (bœuf/dinde/porc) et teneur en matières grasses non déterminables",
    "Quantité d’huile/fromage éventuel non visible",
    "Teneur en sel/sodium de la sauce (industrielle vs maison) non déductible",
    "Poids exact et quantité réellement consommée (restes éventuels) non visibles",
  ],
  questions_suivi: [
    "Comment te sens-tu aujourd’hui (faim, satiété, énergie) avant ou après ce repas ?",
    "Avec l’anneau gastrique, est-ce que ce type d’aliment passe bien en ce moment (nausées, blocage, reflux, inconfort) ?",
    "Est-ce que tu souhaites qu’on en parle côté objectifs (tension, confort digestif, poids) ou tu préfères juste une estimation nutritionnelle ?",
  ],
  avertissement_pathologies: [
    "Allergie au gluten : plat potentiellement NON compatible car les spaghetti sont très souvent à base de blé (gluten). Compatible uniquement si les pâtes sont certifiées sans gluten et si absence de contamination croisée.",
    "Hypertension : vigilance sur le sodium (sauce tomate préparée, bouillon, sel ajouté, fromage). Sans information, risque de teneur élevée en sel ; privilégier version maison/peu salée.",
    "Anneau gastrique : portion du bol probablement trop grande ; les pâtes peuvent se compacter et provoquer inconfort/blocage selon tolérance. Recommandation pratique : petites bouchées, bien mâcher, portion réduite, éviter de boire pendant le repas (selon consignes médicales).",
  ],
};

const MOCK_FALLBACK_ANALYSIS_RESPONSE: ScannerMockAnalysisResponse = {
  plats_probables: [],
  ingredients_visibles: [],
  portion_estimee:
    "Impossible à estimer : aucun aliment/plat n’est visible sur la photo (elle montre une personne dans une pièce).",
  nutrition_estimee: {
    calories_kcal: { min: 0, max: 0 },
    proteines_g: { min: 0, max: 0 },
    glucides_g: { min: 0, max: 0 },
    lipides_g: { min: 0, max: 0 },
    fibres_g: { min: 0, max: 0 },
  },
  score_sante_100: 0,
  confiance_100: 0,
  incertitudes: [
    "Aucun plat/aliment n’est visible, donc identification impossible.",
    "Aucune information sur ingrédients, mode de cuisson, marque ou recettes.",
    "Portions et quantités impossibles à déduire sans photo de la nourriture.",
  ],
  questions_suivi: [
    "Peux-tu envoyer une photo claire du plat (vue de dessus) avec l’assiette entière visible ?",
    "Quel est le nom du plat et ses ingrédients principaux (ou une liste rapide) ?",
    "Quelle quantité approximative as-tu mangée (assiette entière, moitié, et/ou poids/volume) ?",
  ],
  avertissement_pathologies: [
    "Compatibilité avec les pathologies non évaluable : aucun aliment n’est visible sur la photo.",
  ],
};

const MOCK_HUMAN_ANALYSIS_RESPONSE: ScannerMockAnalysisResponse = {
  plats_probables: [],
  ingredients_visibles: [],
  portion_estimee: "Non déterminable : aucun plat/aliment n’est visible sur la photo.",
  nutrition_estimee: {
    calories_kcal: { min: 0, max: 0 },
    proteines_g: { min: 0, max: 0 },
    glucides_g: { min: 0, max: 0 },
    lipides_g: { min: 0, max: 0 },
    fibres_g: { min: 0, max: 0 },
  },
  score_sante_100: 0,
  confiance_100: 5,
  incertitudes: [
    "Aucun aliment/plat n’est visible (photo centrée sur une personne et un intérieur).",
    "Impossible d’identifier des ingrédients, une portion ou un mode de préparation.",
    "Aucune information exploitable pour estimer la nutrition (calories/macros/fibres).",
  ],
  questions_suivi: [
    "Quel est le plat/repas consommé (nom ou description) ?",
    "Quels sont les ingrédients principaux et la façon de préparation (huile, sauce, frit, etc.) ?",
    "Quelle quantité as-tu mangée (portion, poids approximatif ou nombre d’unités) ?",
  ],
  avertissement_pathologies: [
    "Compatibilité avec les pathologies non évaluable : aucun repas n’est visible sur la photo.",
  ],
};

const isImageSource = (value: string): value is ImageSource => {
  return value === "fichier" || value === "collage" || value === "url" || value === "camera";
};

const parseDraft = (rawDraft: string): ScannerMealDraft | null => {
  try {
    const parsedDraft: unknown = JSON.parse(rawDraft);
    if (!parsedDraft || typeof parsedDraft !== "object") {
      return null;
    }

    const candidate = parsedDraft as Partial<ScannerMealDraft>;

    if (
      typeof candidate.imageUrl !== "string" ||
      typeof candidate.source !== "string" ||
      !isImageSource(candidate.source) ||
      typeof candidate.savedAt !== "string"
    ) {
      return null;
    }

    return {
      imageUrl: candidate.imageUrl,
      source: candidate.source,
      savedAt: candidate.savedAt,
      fileName: typeof candidate.fileName === "string" ? candidate.fileName : undefined,
    };
  } catch {
    return null;
  }
};

const formatSavedAt = (savedAt: string): string => {
  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) {
    return "Date inconnue";
  }

  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const cloneAnalysisResponse = (
  response: ScannerMockAnalysisResponse,
): ScannerMockAnalysisResponse => {
  return JSON.parse(JSON.stringify(response)) as ScannerMockAnalysisResponse;
};

const listToMultiline = (items: string[]): string => {
  return items.join("\n");
};

const multilineToList = (value: string): string[] => {
  return value.split("\n").filter((line) => line.trim().length > 0);
};

const normalizeFileName = (fileName: string | undefined): string => {
  return fileName?.trim().toLowerCase() ?? "";
};

const formatDateForPrompt = (value?: string | null): string => {
  if (!value) {
    return "non renseignée";
  }

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
};

const formatPromptProfileValue = (value?: string | null): string => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "non renseigné";
};

const formatMedicalTagsForPrompt = (tags?: string[] | null): string => {
  const cleanedTags = (tags ?? []).map((tag) => tag.replace(/\s+/g, " ").trim()).filter(Boolean);
  return cleanedTags.length > 0
    ? cleanedTags.map((tag) => `(${tag})`).join(" ")
    : "aucune pathologie renseignée";
};

const formatMealMomentForPrompt = (mealMoment: ScannerMealDetails["mealMoment"]): string => {
  switch (mealMoment) {
    case "petit_dejeuner":
      return "petit-déjeuner";
    case "dejeuner":
      return "déjeuner";
    case "diner":
      return "dîner";
    case "collation":
      return "collation";
    default:
      return "";
  }
};

const buildScannerAnalysisPrompt = (
  profile: UserProfilePromptPayload | null | undefined,
  details: ScannerMealDetails,
): string => {
  const dishName = details.dishName.trim();
  const estimatedPortions = details.estimatedPortions.trim();
  const ingredients = details.ingredients.trim();
  const notes = details.notes.trim();
  const mealMoment = formatMealMomentForPrompt(details.mealMoment);

  const providedUserContextParts = [
    dishName ? `Nom du plat : (${dishName})` : null,
    mealMoment ? `Moment du repas: (${mealMoment})` : null,
    estimatedPortions ? `Portions estimées: (${estimatedPortions})` : null,
    ingredients ? `Ingrédients principaux: (${ingredients})` : null,
    notes ? `Notes complémentaires: (${notes})` : null,
  ].filter(Boolean) as string[];

  const detailsContext =
    providedUserContextParts.length === 0
      ? "Contexte utilisateur: aucun détail texte n’a été saisi (nom du plat, portions, ingrédients, notes vides)."
      : providedUserContextParts.length < 5
        ? `Contexte utilisateur: L'utilisateur n'a fourni que c'est informations ${providedUserContextParts.join(" ")}`
        : `Contexte utilisateur: ${providedUserContextParts.join(" ")}`;

  return `Tu es un assistant de nutrition. Analyse uniquement la photo fournie.
${detailsContext}

Objectifs:
1) Identifier le(s) plat(s) probable(s) et les ingrédients visibles.
2) Estimer les portions (petite/moyenne/grande + estimation en grammes si possible).
3) Donner une estimation nutritionnelle sous forme de fourchettes:
   - calories
   - protéines
   - glucides
   - lipides
   - fibres
4) Donner un score santé sur 100 avec explication courte.
5) Donner un niveau de confiance global en pourcentage %.
6) Lister ce qui est incertain ou non visible.
7) Proposer 3 questions max à poser à l’utilisateur pour améliorer la précision.
8) Les catégories : incertitudes et questions_suivi ne doivent pas comporter les même questions.
9) La catégories incertitudes concernent ce que tu n'arrive pas à identifier correctement.
10) La catégorie questions_suivi concerne plutôt ce qu'un coach en nutrition pourrait demander sur comment se sent la personne aujourd'hui et si elle souhaite en parler.
11) Vérifier si ce plat est compatible avec une des pathologies de la personne voulant consommer ce plat.

Voici les informations importante que tu dois savoir sur cette personne :
Sexe: ${formatPromptProfileValue(profile?.gender)}
Date de naissance: ${formatDateForPrompt(profile?.dateOfBirth)}
Taille: ${profile?.height ?? "non renseignée"} cm
Poids: ${profile?.currentWeight ?? "non renseigné"} kilos
pathologies: ${formatMedicalTagsForPrompt(profile?.medicalTags)}

Contraintes:
- N’invente pas d’éléments non visibles.
- Si la photo est insuffisante, indique-le clairement.
- Réponds en JSON strict avec ces clés:
{
  "plats_probables": [],
  "ingredients_visibles": [],
  "portion_estimee": "",
  "nutrition_estimee": {
    "calories_kcal": {"min": 0, "max": 0},
    "proteines_g": {"min": 0, "max": 0},
    "glucides_g": {"min": 0, "max": 0},
    "lipides_g": {"min": 0, "max": 0},
    "fibres_g": {"min": 0, "max": 0}
  },
  "score_sante_100": 0,
  "confiance_100": 0,
  "incertitudes": [],
  "questions_suivi": [],
  "avertissement_pathologies": []
}`;
};

export default function ScannerRepasDetailsPage() {
  const { data: userProfilePromptData } = useQuery<UserProfilePromptQueryData>(
    USER_PROFILE_PROMPT_QUERY,
    {
      fetchPolicy: "cache-and-network",
    },
  );
  const [saveScannerCoachSubmission, { loading: isSavingCoachSubmission }] = useMutation<
    SaveScannerCoachSubmissionMutationData,
    SaveScannerCoachSubmissionMutationVariables
  >(SAVE_SCANNER_COACH_SUBMISSION_MUTATION);
  const [draft, setDraft] = useState<ScannerMealDraft | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [details, setDetails] = useState<ScannerMealDetails>(DEFAULT_DETAILS);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [analysisResponse, setAnalysisResponse] = useState<ScannerMockAnalysisResponse | null>(
    null,
  );
  const [editableAnalysis, setEditableAnalysis] = useState<ScannerMockAnalysisResponse | null>(
    null,
  );
  const [isEditingPortion, setIsEditingPortion] = useState(false);
  const [editingMetrics, setEditingMetrics] = useState<
    Partial<Record<NutritionMetricKey, boolean>>
  >({});
  const [editingLists, setEditingLists] = useState<Record<EditableListSection, boolean>>({
    plats_probables: false,
    ingredients_visibles: false,
  });
  const [showIncertitudesReply, setShowIncertitudesReply] = useState(false);
  const [showQuestionsReply, setShowQuestionsReply] = useState(false);
  const [incertitudesReply, setIncertitudesReply] = useState("");
  const [questionsReply, setQuestionsReply] = useState("");
  const [mealAlreadyConsumed, setMealAlreadyConsumed] = useState<"" | "oui" | "non">("");
  const [coachSendMessage, setCoachSendMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imagePanelRef = useRef<HTMLElement | null>(null);
  const imagePanelGridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const rawDraft = window.sessionStorage.getItem(SCANNER_MEAL_DRAFT_KEY);
    if (!rawDraft) {
      setPageError("Aucun scan enregistré. Reviens à la page de scan pour ajouter une image.");
      return;
    }

    const parsedDraft = parseDraft(rawDraft);
    if (!parsedDraft) {
      setPageError("Le brouillon de scan est invalide. Merci de refaire un scan.");
      return;
    }

    setDraft(parsedDraft);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!draft) {
      return;
    }

    const scrollContainer = document.querySelector("main");
    const imagePanel = imagePanelRef.current;
    const imagePanelGrid = imagePanelGridRef.current;

    if (!(scrollContainer instanceof HTMLElement) || !imagePanel || !imagePanelGrid) {
      return;
    }

    const updateImagePanelPosition = () => {
      // On small screens, keep natural document flow (no floating/follow behavior).
      if (window.innerWidth < 1024) {
        imagePanel.style.transform = "translateY(0px)";
        return;
      }

      const rawOffset = scrollContainer.scrollTop - imagePanelGrid.offsetTop + 32;
      const maxOffset = Math.max(0, imagePanelGrid.offsetHeight - imagePanel.offsetHeight + 100);
      const translateY = Math.max(0, Math.min(rawOffset, maxOffset));
      imagePanel.style.transform = `translateY(${translateY}px)`;
    };

    const resizeObserver = new ResizeObserver(updateImagePanelPosition);
    resizeObserver.observe(imagePanelGrid);
    resizeObserver.observe(imagePanel);

    updateImagePanelPosition();
    scrollContainer.addEventListener("scroll", updateImagePanelPosition, { passive: true });
    window.addEventListener("resize", updateImagePanelPosition);

    return () => {
      scrollContainer.removeEventListener("scroll", updateImagePanelPosition);
      window.removeEventListener("resize", updateImagePanelPosition);
      resizeObserver.disconnect();
    };
  }, [draft]);

  const sourceLabel = useMemo(() => {
    if (!draft) {
      return "Inconnue";
    }

    return SOURCE_LABELS[draft.source];
  }, [draft]);

  const analysisData = editableAnalysis ?? analysisResponse;

  const updateDetail = useCallback(
    <Key extends keyof ScannerMealDetails>(key: Key, value: ScannerMealDetails[Key]) => {
      setDetails((currentDetails) => ({
        ...currentDetails,
        [key]: value,
      }));
    },
    [],
  );

  const toggleMetricEditing = useCallback((metricKey: NutritionMetricKey) => {
    setEditingMetrics((current) => ({
      ...current,
      [metricKey]: !current[metricKey],
    }));
  }, []);

  const updateNutritionRange = useCallback(
    (metricKey: NutritionMetricKey, bound: "min" | "max", nextValue: string) => {
      const parsedValue = Number(nextValue);
      if (!Number.isFinite(parsedValue)) {
        return;
      }

      setEditableAnalysis((currentAnalysis) => {
        if (!currentAnalysis) {
          return currentAnalysis;
        }

        return {
          ...currentAnalysis,
          nutrition_estimee: {
            ...currentAnalysis.nutrition_estimee,
            [metricKey]: {
              ...currentAnalysis.nutrition_estimee[metricKey],
              [bound]: parsedValue,
            },
          },
        };
      });
    },
    [],
  );

  const togglePortionEditing = useCallback(() => {
    setIsEditingPortion((current) => !current);
  }, []);

  const updatePortionEstimate = useCallback((nextValue: string) => {
    setEditableAnalysis((currentAnalysis) => {
      if (!currentAnalysis) {
        return currentAnalysis;
      }

      return {
        ...currentAnalysis,
        portion_estimee: nextValue,
      };
    });
  }, []);

  const toggleListEditing = useCallback((section: EditableListSection) => {
    setEditingLists((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }, []);

  const updateEditableList = useCallback((section: EditableListSection, nextValue: string) => {
    setEditableAnalysis((currentAnalysis) => {
      if (!currentAnalysis) {
        return currentAnalysis;
      }

      return {
        ...currentAnalysis,
        [section]: multilineToList(nextValue),
      };
    });
  }, []);

  const resetEditionState = useCallback(() => {
    setIsEditingPortion(false);
    setEditingMetrics({});
    setEditingLists({
      plats_probables: false,
      ingredients_visibles: false,
    });
    setShowIncertitudesReply(false);
    setShowQuestionsReply(false);
    setIncertitudesReply("");
    setQuestionsReply("");
    setMealAlreadyConsumed("");
    setCoachSendMessage(null);
  }, []);

  const handleSaveAndSendToCoach = useCallback(async () => {
    if (!analysisData) {
      setCoachSendMessage("Aucune analyse à enregistrer pour le coach.");
      return;
    }

    if (!draft) {
      setCoachSendMessage("Aucun scan disponible à enregistrer.");
      return;
    }

    if (typeof window === "undefined") {
      setCoachSendMessage("Enregistrement impossible sur cet appareil.");
      return;
    }

    setCoachSendMessage(null);

    let analysisRequestPayload: unknown = null;
    let analysisRequestPrompt: string | null = null;

    const rawAnalysisRequest = window.sessionStorage.getItem(SCANNER_ANALYSIS_REQUEST_KEY);
    if (rawAnalysisRequest) {
      try {
        const parsedRequest: unknown = JSON.parse(rawAnalysisRequest);
        analysisRequestPayload = parsedRequest;
        if (
          parsedRequest &&
          typeof parsedRequest === "object" &&
          "prompt" in parsedRequest &&
          typeof (parsedRequest as { prompt?: unknown }).prompt === "string"
        ) {
          analysisRequestPrompt = (parsedRequest as { prompt: string }).prompt;
        }
      } catch {
        analysisRequestPayload = null;
      }
    }

    const coachPayload = {
      draft,
      details,
      analysis: analysisData,
      reponseIncertitudes: incertitudesReply.trim(),
      reponseQuestionsSuivi: questionsReply.trim(),
      platDejaConsomme: mealAlreadyConsumed || null,
      promptAnalyse: analysisRequestPrompt,
      requeteAnalyse: analysisRequestPayload,
      savedAt: new Date().toISOString(),
    };

    const payloadJson = JSON.stringify(coachPayload);
    window.sessionStorage.setItem(SCANNER_COACH_PAYLOAD_KEY, payloadJson);

    try {
      const response = await saveScannerCoachSubmission({
        variables: { payloadJson },
      });

      if (response.data?.saveScannerCoachSubmission) {
        setCoachSendMessage("Informations enregistrées en base et prêtes pour le coach.");
        return;
      }

      setCoachSendMessage("Enregistrement local effectué, mais la sauvegarde en base a échoué.");
    } catch {
      setCoachSendMessage("Enregistrement local effectué, mais la sauvegarde en base a échoué.");
    }
  }, [
    analysisData,
    details,
    draft,
    incertitudesReply,
    mealAlreadyConsumed,
    questionsReply,
    saveScannerCoachSubmission,
  ]);

  const handleRequestAnalysis = useCallback(async () => {
    if (!draft) {
      setSubmitError("Aucune image disponible pour lancer une analyse.");
      return;
    }

    setSubmitError(null);
    setSubmitMessage(null);
    setAnalysisResponse(null);
    setEditableAnalysis(null);
    resetEditionState();
    setIsSubmitting(true);

    try {
      const payload: ScannerAnalysisRequest = {
        draft,
        details: {
          dishName: details.dishName.trim(),
          mealMoment: details.mealMoment,
          estimatedPortions: details.estimatedPortions.trim(),
          ingredients: details.ingredients.trim(),
          notes: details.notes.trim(),
        },
        requestedAt: new Date().toISOString(),
      };

      if (typeof window === "undefined") {
        throw new Error("Storage indisponible");
      }

      const payloadWithPrompt = {
        ...payload,
        prompt: buildScannerAnalysisPrompt(userProfilePromptData?.userProfileData, payload.details),
      };

      console.info("[MealsScanning] Prompt analyse IA envoyé:", payloadWithPrompt.prompt);

      window.sessionStorage.setItem(
        SCANNER_ANALYSIS_REQUEST_KEY,
        JSON.stringify(payloadWithPrompt),
      );

      const normalizedFileName = normalizeFileName(draft.fileName);

      if (normalizedFileName === MOCK_HUMAN_FILE_NAME) {
        window.sessionStorage.setItem(
          SCANNER_ANALYSIS_RESPONSE_KEY,
          JSON.stringify(MOCK_HUMAN_ANALYSIS_RESPONSE),
        );
        setAnalysisResponse(MOCK_HUMAN_ANALYSIS_RESPONSE);
        setEditableAnalysis(cloneAnalysisResponse(MOCK_HUMAN_ANALYSIS_RESPONSE));
        setSubmitMessage("Analyse disponible.");
        return;
      }

      if (normalizedFileName !== MOCK_TRIGGER_FILE_NAME) {
        window.sessionStorage.setItem(
          SCANNER_ANALYSIS_RESPONSE_KEY,
          JSON.stringify(MOCK_FALLBACK_ANALYSIS_RESPONSE),
        );
        setAnalysisResponse(MOCK_FALLBACK_ANALYSIS_RESPONSE);
        setEditableAnalysis(cloneAnalysisResponse(MOCK_FALLBACK_ANALYSIS_RESPONSE));
        setSubmitMessage("Analyse disponible.");
        return;
      }

      setSubmitMessage("Demande envoyée. Analyse en cours.");

      await new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), MOCK_ANALYSIS_DELAY_MS);
      });

      window.sessionStorage.setItem(
        SCANNER_ANALYSIS_RESPONSE_KEY,
        JSON.stringify(MOCK_ANALYSIS_RESPONSE),
      );
      setAnalysisResponse(MOCK_ANALYSIS_RESPONSE);
      setEditableAnalysis(cloneAnalysisResponse(MOCK_ANALYSIS_RESPONSE));
      setSubmitMessage("Réponse reçue après 10 secondes.");
    } catch {
      setSubmitError("Impossible d'enregistrer la demande d'analyse.");
    } finally {
      setIsSubmitting(false);
    }
  }, [details, draft, resetEditionState, userProfilePromptData?.userProfileData]);

  return (
    <HomeLayout pageTitle="Détails du repas" footerVariant="userSlim">
      <UserPageLayout activeNav="aiAssist">
        <div className="max-w-3xl text-[#2c2c2c]">
          <h1 className="text-lg font-semibold">Détails du repas</h1>
          <p className="mt-1 text-xs text-[#555]">
            Tu peux ajouter des informations complémentaires sur ton plat (facultatif), puis envoyer
            une demande d'analyse.
          </p>
        </div>

        {pageError ? (
          <div className="mt-6 rounded-md border border-[#e2b8b8] bg-[#fff3f3] p-4 text-xs text-[#7d2d2d]">
            <p>{pageError}</p>
            <Link
              href="/meals_scanning"
              className="mt-3 inline-block rounded-md bg-[#2c2c2c] px-4 py-2 font-semibold text-white"
            >
              Retour au scan
            </Link>
          </div>
        ) : !draft ? (
          <div className="mt-6 rounded-md border border-[#c7d6bf] bg-[#edf4e7] px-4 py-3 text-xs text-[#456145]">
            Chargement du scan...
          </div>
        ) : (
          <div
            ref={imagePanelGridRef}
            className="mt-6 grid items-start gap-4 lg:grid-cols-[320px_minmax(0,1fr)]"
          >
            <aside
              ref={imagePanelRef}
              className="self-start rounded-md border border-[#c4c4c4] bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.12)] will-change-transform"
            >
              <h2 className="text-sm font-semibold text-[#2c2c2c]">Image enregistrée</h2>
              <p className="mt-1 text-[11px] text-[#666]">Source: {sourceLabel}</p>
              <p className="text-[11px] text-[#666]">Enregistrée: {formatSavedAt(draft.savedAt)}</p>
              <p className="text-[11px] text-[#666]">
                Nom du fichier: {draft.fileName ?? "inconnu"}
              </p>

              <div className="mt-3 overflow-hidden rounded-md border border-[#d1d1d1] bg-[#f7f7f7]">
                <Image
                  src={draft.imageUrl}
                  alt="Repas enregistré"
                  width={1200}
                  height={900}
                  unoptimized
                  loader={({ src }) => src}
                  className="h-75 w-full object-cover"
                />
              </div>

              <Link
                href="/meals_scanning"
                className="mt-3 block w-full rounded-md bg-[#2c2c2c] px-3 py-2 text-center text-xs font-semibold text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
              >
                Changer l'image
              </Link>
            </aside>

            <section className="rounded-md border border-[#b6c7ac] bg-[#edf4e7] p-4 shadow-[0_2px_5px_rgba(0,0,0,0.12)]">
              <h2 className="text-sm font-semibold text-[#2f4a2f]">Informations facultatives</h2>
              <p className="mt-1 text-[11px] text-[#456145]">Tous les champs sont optionnels.</p>

              <div className="mt-4 space-y-3">
                <div>
                  <label htmlFor="dish-name" className="block text-[11px] text-[#355335]">
                    Nom du plat
                  </label>
                  <input
                    id="dish-name"
                    type="text"
                    value={details.dishName}
                    onChange={(event) => updateDetail("dishName", event.target.value)}
                    placeholder="Ex: Salade composée"
                    className="mt-1 w-full rounded-md border border-[#c3d2ba] bg-white px-3 py-2 text-xs text-[#2c2c2c]"
                  />
                </div>

                <div>
                  <label htmlFor="meal-moment" className="block text-[11px] text-[#355335]">
                    Moment du repas
                  </label>
                  <select
                    id="meal-moment"
                    value={details.mealMoment}
                    onChange={(event) =>
                      updateDetail(
                        "mealMoment",
                        event.target.value as ScannerMealDetails["mealMoment"],
                      )
                    }
                    className="mt-1 w-full rounded-md border border-[#c3d2ba] bg-white px-3 py-2 text-xs text-[#2c2c2c]"
                  >
                    <option value="">Non précisé</option>
                    <option value="petit_dejeuner">Petit-déjeuner</option>
                    <option value="dejeuner">Déjeuner</option>
                    <option value="diner">Dîner</option>
                    <option value="collation">Collation</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="meal-portions" className="block text-[11px] text-[#355335]">
                    Portions estimées
                  </label>
                  <input
                    id="meal-portions"
                    type="text"
                    value={details.estimatedPortions}
                    onChange={(event) => updateDetail("estimatedPortions", event.target.value)}
                    placeholder="Ex: 1 assiette"
                    className="mt-1 w-full rounded-md border border-[#c3d2ba] bg-white px-3 py-2 text-xs text-[#2c2c2c]"
                  />
                </div>

                <div>
                  <label htmlFor="meal-ingredients" className="block text-[11px] text-[#355335]">
                    Ingrédients principaux
                  </label>
                  <textarea
                    id="meal-ingredients"
                    value={details.ingredients}
                    onChange={(event) => updateDetail("ingredients", event.target.value)}
                    placeholder="Ex: quinoa, pois chiches, avocat..."
                    rows={3}
                    className="mt-1 w-full rounded-md border border-[#c3d2ba] bg-white px-3 py-2 text-xs text-[#2c2c2c]"
                  />
                </div>

                <div>
                  <label htmlFor="meal-notes" className="block text-[11px] text-[#355335]">
                    Notes complémentaires
                  </label>
                  <textarea
                    id="meal-notes"
                    value={details.notes}
                    onChange={(event) => updateDetail("notes", event.target.value)}
                    placeholder="Ex: cuisson au four, sans sauce, fait maison..."
                    rows={4}
                    className="mt-1 w-full rounded-md border border-[#c3d2ba] bg-white px-3 py-2 text-xs text-[#2c2c2c]"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/meals_scanning"
                  className="rounded-md bg-[#555] px-4 py-2 text-center text-xs font-semibold text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                >
                  Retour au scan
                </Link>
                <button
                  type="button"
                  onClick={handleRequestAnalysis}
                  disabled={isSubmitting}
                  className="rounded-md bg-[#ca1685] px-4 py-2 text-xs font-semibold text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isSubmitting ? "Analyse en cours..." : "Demander une analyse"}
                </button>
              </div>

              {submitError && <p className="mt-3 text-xs text-[#8a2a2a]">{submitError}</p>}
              {submitMessage && <p className="mt-3 text-xs text-[#1d7a42]">{submitMessage}</p>}
              {!analysisData && (
                <div className="mt-4 rounded-md border border-[#c3d2ba] bg-white p-4">
                  <h3 className="text-sm font-semibold text-[#2f4a2f]">
                    Résultat de l&apos;analyse
                  </h3>
                  <div className="mt-3 grid min-h-36 place-items-center rounded-md border border-dashed border-[#cfdcc8] bg-[#f8fbf6] px-4 py-4 text-center">
                    <p className="text-xs text-[#4f5e4f]">
                      {isSubmitting
                        ? "Analyse en cours. Les résultats vont apparaître ici."
                        : "Lance une analyse pour afficher les résultats et compléter ce formulaire."}
                    </p>
                  </div>
                </div>
              )}
              {analysisData && (
                <div className="mt-4 space-y-4 rounded-md border border-[#c3d2ba] bg-white p-4">
                  <h3 className="text-sm font-semibold text-[#2f4a2f]">Résultat de l'analyse</h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-md border border-[#d3e0cc] bg-[#f4f8f1] px-3 py-2">
                      <p className="text-[11px] text-[#456145]">Score santé</p>
                      <p className="text-sm font-semibold text-[#2c2c2c]">
                        {analysisData.score_sante_100}/100
                      </p>
                    </div>
                    <div className="rounded-md border border-[#d3e0cc] bg-[#f4f8f1] px-3 py-2">
                      <p className="text-[11px] text-[#456145]">Confiance</p>
                      <p className="text-sm font-semibold text-[#2c2c2c]">
                        {analysisData.confiance_100}%
                      </p>
                    </div>
                  </div>

                  <div className="rounded-md border border-[#d3e0cc] bg-[#f8fbf6] px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] text-[#456145]">Portion estimée</p>
                      <button
                        type="button"
                        onClick={togglePortionEditing}
                        className="rounded border border-[#9fb79b] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#365635]"
                      >
                        {isEditingPortion ? "Terminer" : "Editer"}
                      </button>
                    </div>
                    {isEditingPortion ? (
                      <textarea
                        id="portion-estimee"
                        value={analysisData.portion_estimee}
                        onChange={(event) => updatePortionEstimate(event.target.value)}
                        rows={3}
                        className="mt-2 w-full rounded border border-[#bdd0b8] bg-white px-2 py-1.5 text-xs text-[#2c2c2c]"
                      />
                    ) : (
                      <p className="mt-1 text-xs text-[#2c2c2c]">{analysisData.portion_estimee}</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-[#2f4a2f]">Nutrition estimée</h4>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {NUTRITION_METRICS.map((metric) => {
                        const value = analysisData.nutrition_estimee[metric.key];
                        const isEditing = Boolean(editingMetrics[metric.key]);
                        return (
                          <div
                            key={metric.key}
                            className="rounded-md border border-[#d8e3d2] bg-[#f6faf3] px-3 py-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[11px] text-[#456145]">{metric.label}</p>
                              <button
                                type="button"
                                onClick={() => toggleMetricEditing(metric.key)}
                                className="rounded border border-[#9fb79b] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#365635]"
                              >
                                {isEditing ? "Terminer" : "Editer"}
                              </button>
                            </div>
                            {isEditing ? (
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                <label
                                  className="text-[10px] text-[#456145]"
                                  htmlFor={`${metric.key}-min`}
                                >
                                  Min
                                  <input
                                    id={`${metric.key}-min`}
                                    type="number"
                                    value={value.min}
                                    onChange={(event) =>
                                      updateNutritionRange(metric.key, "min", event.target.value)
                                    }
                                    className="mt-1 w-full rounded border border-[#bdd0b8] bg-white px-2 py-1 text-[11px] text-[#2c2c2c]"
                                  />
                                </label>
                                <label
                                  className="text-[10px] text-[#456145]"
                                  htmlFor={`${metric.key}-max`}
                                >
                                  Max
                                  <input
                                    id={`${metric.key}-max`}
                                    type="number"
                                    value={value.max}
                                    onChange={(event) =>
                                      updateNutritionRange(metric.key, "max", event.target.value)
                                    }
                                    className="mt-1 w-full rounded border border-[#bdd0b8] bg-white px-2 py-1 text-[11px] text-[#2c2c2c]"
                                  />
                                </label>
                              </div>
                            ) : (
                              <p className="text-xs font-semibold text-[#2c2c2c]">
                                {value.min} à {value.max} {metric.unit}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="rounded-md border border-[#d8e3d2] bg-[#f9fcf7] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold text-[#2f4a2f]">Plats probables</h4>
                        <button
                          type="button"
                          onClick={() => toggleListEditing("plats_probables")}
                          className="rounded border border-[#9fb79b] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#365635]"
                        >
                          {editingLists.plats_probables ? "Terminer" : "Editer"}
                        </button>
                      </div>
                      {editingLists.plats_probables ? (
                        <textarea
                          value={listToMultiline(analysisData.plats_probables)}
                          onChange={(event) =>
                            updateEditableList("plats_probables", event.target.value)
                          }
                          rows={6}
                          className="mt-2 w-full rounded border border-[#bdd0b8] bg-white px-2 py-1.5 text-xs text-[#2c2c2c]"
                        />
                      ) : analysisData.plats_probables.length > 0 ? (
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[#2c2c2c]">
                          {analysisData.plats_probables.map((dish) => (
                            <li key={dish}>{dish}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs text-[#5a6a57]">Aucun plat détecté.</p>
                      )}
                    </div>

                    <div className="rounded-md border border-[#d8e3d2] bg-[#f9fcf7] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold text-[#2f4a2f]">
                          Ingrédients visibles
                        </h4>
                        <button
                          type="button"
                          onClick={() => toggleListEditing("ingredients_visibles")}
                          className="rounded border border-[#9fb79b] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#365635]"
                        >
                          {editingLists.ingredients_visibles ? "Terminer" : "Editer"}
                        </button>
                      </div>
                      {editingLists.ingredients_visibles ? (
                        <textarea
                          value={listToMultiline(analysisData.ingredients_visibles)}
                          onChange={(event) =>
                            updateEditableList("ingredients_visibles", event.target.value)
                          }
                          rows={6}
                          className="mt-2 w-full rounded border border-[#bdd0b8] bg-white px-2 py-1.5 text-xs text-[#2c2c2c]"
                        />
                      ) : analysisData.ingredients_visibles.length > 0 ? (
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[#2c2c2c]">
                          {analysisData.ingredients_visibles.map((ingredient) => (
                            <li key={ingredient}>{ingredient}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs text-[#5a6a57]">Aucun ingrédient détecté.</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="rounded-md border border-[#efd4a8] bg-[#fff7e8] p-3 lg:col-span-2">
                      <h4 className="text-xs font-semibold text-[#8a5a12]">
                        Avertissements pathologies / contre-indications
                      </h4>
                      {analysisData.avertissement_pathologies.length > 0 ? (
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[#2c2c2c]">
                          {analysisData.avertissement_pathologies.map((warning) => (
                            <li key={warning}>{warning}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs text-[#6d633f]">
                          Aucun avertissement spécifique signalé.
                        </p>
                      )}
                    </div>

                    <div className="rounded-md border border-[#e5ddcb] bg-[#fffaf0] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold text-[#7a5c27]">Incertitudes</h4>
                        <button
                          type="button"
                          onClick={() => setShowIncertitudesReply((current) => !current)}
                          className="rounded border border-[#d2bf95] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#7a5c27]"
                        >
                          Répondre
                        </button>
                      </div>
                      {analysisData.incertitudes.length > 0 ? (
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[#2c2c2c]">
                          {analysisData.incertitudes.map((uncertainty) => (
                            <li key={uncertainty}>{uncertainty}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs text-[#5a6a57]">Aucune incertitude signalée.</p>
                      )}
                      {showIncertitudesReply && analysisData.incertitudes.length > 0 && (
                        <div className="mt-3">
                          <label
                            htmlFor="incertitudes-reply"
                            className="block text-[11px] font-medium text-[#7a5c27]"
                          >
                            Ta réponse aux incertitudes
                          </label>
                          <textarea
                            id="incertitudes-reply"
                            value={incertitudesReply}
                            onChange={(event) => setIncertitudesReply(event.target.value)}
                            rows={4}
                            className="mt-1 w-full rounded border border-[#d6c8a7] bg-white px-2 py-1.5 text-xs text-[#2c2c2c]"
                          />
                        </div>
                      )}
                    </div>

                    <div className="rounded-md border border-[#d8e3d2] bg-[#f9fcf7] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold text-[#2f4a2f]">Questions de suivi</h4>
                        <button
                          type="button"
                          onClick={() => setShowQuestionsReply((current) => !current)}
                          className="rounded border border-[#9fb79b] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#365635]"
                        >
                          Répondre
                        </button>
                      </div>
                      {analysisData.questions_suivi.length > 0 ? (
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[#2c2c2c]">
                          {analysisData.questions_suivi.map((question) => (
                            <li key={question}>{question}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs text-[#5a6a57]">
                          Aucune question de suivi nécessaire.
                        </p>
                      )}
                      {showQuestionsReply && analysisData.questions_suivi.length > 0 && (
                        <div className="mt-3">
                          <label
                            htmlFor="questions-reply"
                            className="block text-[11px] font-medium text-[#2f4a2f]"
                          >
                            Tes précisions sur les questions
                          </label>
                          <textarea
                            id="questions-reply"
                            value={questionsReply}
                            onChange={(event) => setQuestionsReply(event.target.value)}
                            rows={4}
                            className="mt-1 w-full rounded border border-[#bdd0b8] bg-white px-2 py-1.5 text-xs text-[#2c2c2c]"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-md border border-[#d8e3d2] bg-[#f7faf4] p-3">
                    <h4 className="text-xs font-semibold text-[#2f4a2f]">
                      Ce plat a-t-il déjà été consommé ?
                    </h4>
                    <div className="mt-2 flex flex-wrap items-center gap-5 text-xs text-[#2c2c2c]">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="mealAlreadyConsumed"
                          checked={mealAlreadyConsumed === "oui"}
                          onChange={() => setMealAlreadyConsumed("oui")}
                          className="accent-[#2f6c4c]"
                        />
                        Oui
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="mealAlreadyConsumed"
                          checked={mealAlreadyConsumed === "non"}
                          onChange={() => setMealAlreadyConsumed("non")}
                          className="accent-[#2f6c4c]"
                        />
                        Non
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={handleSaveAndSendToCoach}
                      disabled={!analysisData || isSavingCoachSubmission}
                      className="rounded-md bg-[#2b3d2a] px-4 py-2 text-xs font-semibold text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                    >
                      {isSavingCoachSubmission
                        ? "Enregistrement..."
                        : "Enregistrer et envoyer au coach"}
                    </button>
                    {coachSendMessage && (
                      <p className="text-xs text-[#2f5f2f]">{coachSendMessage}</p>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </UserPageLayout>
    </HomeLayout>
  );
}
