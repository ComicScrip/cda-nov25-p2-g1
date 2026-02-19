import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import HomeLayout from "@/components/HomeLayout";
import UserPageLayout from "@/components/UserPageLayout";
import {
  type ImageSource,
  SCANNER_ANALYSIS_REQUEST_KEY,
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

export default function ScannerRepasDetailsPage() {
  const [draft, setDraft] = useState<ScannerMealDraft | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [details, setDetails] = useState<ScannerMealDetails>(DEFAULT_DETAILS);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const sourceLabel = useMemo(() => {
    if (!draft) {
      return "Inconnue";
    }

    return SOURCE_LABELS[draft.source];
  }, [draft]);

  const updateDetail = useCallback(
    <Key extends keyof ScannerMealDetails>(key: Key, value: ScannerMealDetails[Key]) => {
      setDetails((currentDetails) => ({
        ...currentDetails,
        [key]: value,
      }));
    },
    [],
  );

  const handleRequestAnalysis = useCallback(async () => {
    if (!draft) {
      setSubmitError("Aucune image disponible pour lancer une analyse.");
      return;
    }

    setSubmitError(null);
    setSubmitMessage(null);
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

      window.sessionStorage.setItem(SCANNER_ANALYSIS_REQUEST_KEY, JSON.stringify(payload));
      setSubmitMessage("Demande d'analyse enregistrée. Elle est prête pour l'étape backend.");
    } catch {
      setSubmitError("Impossible d'enregistrer la demande d'analyse.");
    } finally {
      setIsSubmitting(false);
    }
  }, [details, draft]);

  return (
    <HomeLayout pageTitle="Détails du repas">
      <UserPageLayout activeNav="dashboard">
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
              href="/scanner_repas"
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
          <div className="mt-6 grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="rounded-md border border-[#c4c4c4] bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
              <h2 className="text-sm font-semibold text-[#2c2c2c]">Image enregistrée</h2>
              <p className="mt-1 text-[11px] text-[#666]">Source: {sourceLabel}</p>
              <p className="text-[11px] text-[#666]">Enregistrée: {formatSavedAt(draft.savedAt)}</p>

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
                href="/scanner_repas"
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
                  href="/scanner_repas"
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
                  {isSubmitting ? "Envoi..." : "Demander une analyse"}
                </button>
              </div>

              {submitError && <p className="mt-3 text-xs text-[#8a2a2a]">{submitError}</p>}
              {submitMessage && <p className="mt-3 text-xs text-[#1d7a42]">{submitMessage}</p>}
            </section>
          </div>
        )}
      </UserPageLayout>
    </HomeLayout>
  );
}
