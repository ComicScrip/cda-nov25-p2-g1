import { Edit2, FileText, Loader2, Save, UploadCloud, Users } from "lucide-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import CoachLayout from "@/components/coach/CoachLayout";
import HomeLayout from "@/components/HomeLayout";
import UserPageLayout from "@/components/UserPageLayout";
import {
  UserRole,
  useCoachScannerSubmissionsTestDataQuery,
  useCoachUserMealsTestDataQuery,
  useCoachUserQuery,
  useCoachUsersRecentScannersQuery,
  useProfileQuery,
} from "@/graphql/generated/schema";
import { type ScannerCoachPayload, useNutritionalAnalysis } from "@/hooks/useNutritionalAnalysis";

const getClipboardImageFile = (items: DataTransferItemList | null): File | null => {
  if (!items) {
    return null;
  }

  for (const item of Array.from(items)) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      return item.getAsFile();
    }
  }

  return null;
};

const getFileNameFromContentDisposition = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  const utf8Match = value.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const standardMatch = value.match(/filename="?(.*?)"?(?:;|$)/i);
  return standardMatch?.[1] ? standardMatch[1] : null;
};

// Page for uploading meal photos and displaying nutritional analysis results
export default function NutritionalAnalysisPage() {
  const router = useRouter();
  const [selectedCoacheeId, setSelectedCoacheeId] = useState<string>("");
  const [dataSource, setDataSource] = useState<"meals" | "scanner">("meals");
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [loadingUrlImage, setLoadingUrlImage] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const analysisPanelRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { data: profileData, loading: profileLoading } = useProfileQuery({
    fetchPolicy: "cache-and-network",
  });

  const { data: recentScannersData, loading: recentScannersLoading } =
    useCoachUsersRecentScannersQuery({
      variables: { limit: 10 },
      fetchPolicy: "cache-and-network",
    });
  const { data: coachUsersData } = useCoachUserQuery({
    fetchPolicy: "cache-and-network",
  });
  const { data: mealsData, loading: mealsLoading } = useCoachUserMealsTestDataQuery({
    variables: {
      userId: selectedCoacheeId || undefined,
      limit: 50,
    },
    skip: !selectedCoacheeId,
  });

  const { data: scannerData, loading: scannerLoading } = useCoachScannerSubmissionsTestDataQuery({
    variables: {
      userId: selectedCoacheeId || undefined,
      limit: 50,
    },
    skip: !selectedCoacheeId || dataSource !== "scanner",
  });

  const nutritionalAnalysis = useNutritionalAnalysis();
  const { handleFileChange } = nutritionalAnalysis;
  const hasLoadedImage = Boolean(nutritionalAnalysis.fileBase64);
  const hasUrlInput = urlInput.trim().length > 0;

  const isCoachee = profileData?.me?.role === UserRole.Coachee;
  const isCoach =
    profileData?.me?.role === UserRole.Coach || profileData?.me?.role === UserRole.Admin;

  const recentScanners = recentScannersData?.coachUsersRecentScanners ?? [];
  const allCoachees = coachUsersData?.coachUsers ?? [];
  const recentIds = new Set(recentScanners.map((c) => c.userId));
  const otherCoachees = allCoachees.filter((c) => !recentIds.has(c.userId));
  const coachees = recentScanners.length > 0 ? [...recentScanners, ...otherCoachees] : allCoachees;
  const allCoacheeMeals = mealsData?.coachUserMealsTestData ?? [];
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const coacheeMeals = allCoacheeMeals.filter((meal) => new Date(meal.consumedAt) >= threeDaysAgo);
  const scannerSubmissions = scannerData?.coachScannerSubmissionsTestData ?? [];

  useEffect(() => {
    if (!profileLoading && !profileData?.me) {
      router.push("/login");
    }
  }, [profileData, profileLoading, router]);

  const handleSelectedFile = useCallback(
    async (file: File | null) => {
      if (!file) {
        return;
      }

      setUrlError(null);
      await handleFileChange(file);
    },
    [handleFileChange],
  );

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    void handleSelectedFile(file);
    event.target.value = "";
  };

  const handlePasteArea = (event: React.ClipboardEvent<HTMLLabelElement>) => {
    const imageFile = getClipboardImageFile(event.clipboardData.items);
    if (!imageFile) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    void handleSelectedFile(imageFile);
  };

  const stopCamera = useCallback(() => {
    const currentStream = streamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCameraReady(false);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("La caméra n'est pas disponible sur cet appareil.");
      return;
    }

    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      streamRef.current = stream;
      setCameraActive(true);
    } catch {
      setCameraError("Impossible d'activer la caméra. Vérifiez les permissions.");
    }
  }, [stopCamera]);

  const capturePhoto = useCallback(async () => {
    const videoElement = videoRef.current;
    if (
      !cameraReady ||
      !videoElement ||
      videoElement.videoWidth === 0 ||
      videoElement.videoHeight === 0
    ) {
      setCameraError("Le flux caméra n'est pas prêt.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("Capture impossible.");
      return;
    }

    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    const capturedBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 1);
    });

    if (!capturedBlob) {
      setCameraError("Capture impossible.");
      return;
    }

    const capturedFile = new File([capturedBlob], "capture-camera.jpg", {
      type: capturedBlob.type || "image/jpeg",
    });

    setCameraError(null);
    await handleSelectedFile(capturedFile);
  }, [cameraReady, handleSelectedFile]);

  const handleLoadImageUrl = async () => {
    const trimmedUrl = urlInput.trim();

    if (!trimmedUrl) {
      setUrlError("Collez une URL d'image avant de charger.");
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(trimmedUrl);
    } catch {
      setUrlError("URL invalide. Utilisez un lien http:// ou https://.");
      return;
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      setUrlError("URL invalide. Utilisez un lien http:// ou https://.");
      return;
    }

    setUrlError(null);
    setLoadingUrlImage(true);

    try {
      const response = await fetch("/api/fetch-remote-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorBody = (await response.json()) as { error?: string; details?: string };
          if (errorBody.error) {
            errorMessage = errorBody.details
              ? `${errorBody.error} ${errorBody.details}`
              : errorBody.error;
          }
        } catch {
          // Keep default HTTP status message when response isn't JSON.
        }

        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      if (!blob.type.startsWith("image/")) {
        throw new Error("not-an-image");
      }

      const fileNameFromHeaders =
        getFileNameFromContentDisposition(response.headers.get("content-disposition")) ??
        parsedUrl.pathname.split("/").filter(Boolean).pop()?.split("?")[0];
      const fileNameFromUrl = fileNameFromHeaders || "image-url.jpg";
      const imageFile = new File([blob], decodeURIComponent(fileNameFromUrl), {
        type: blob.type || "image/jpeg",
      });

      await handleSelectedFile(imageFile);
      setUrlError(null);
    } catch (error) {
      console.error("Failed to load image from URL:", error);
      setUrlError(
        "Impossible de charger cette URL d'image. Vérifiez le lien ou les autorisations d'accès.",
      );
    } finally {
      setLoadingUrlImage(false);
    }
  };

  const handleSaveAnalysis = async () => {
    const result = await nutritionalAnalysis.handleSaveAnalysis();
    if (result && !result.success) alert(result.message);
  };

  const handleUpdateQuantities = async () => {
    const result = await nutritionalAnalysis.handleUpdateQuantities();
    if (result && !result.success) alert(result.message);
  };

  const handleUpdateCalories = async () => {
    const result = await nutritionalAnalysis.handleUpdateCalories();
    if (result && !result.success) alert(result.message);
  };

  const handleUpdateDishName = async () => {
    const result = await nutritionalAnalysis.handleUpdateDishName();
    if (result && !result.success) alert(result.message);
  };

  useEffect(() => {
    const handleGlobalPaste = (event: ClipboardEvent) => {
      const imageFile = getClipboardImageFile(event.clipboardData?.items ?? null);
      if (!imageFile) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest('input, textarea, [contenteditable="true"]')
      ) {
        return;
      }

      event.preventDefault();
      void handleSelectedFile(imageFile);
    };

    window.addEventListener("paste", handleGlobalPaste);

    return () => {
      window.removeEventListener("paste", handleGlobalPaste);
    };
  }, [handleSelectedFile]);

  useEffect(() => {
    if (!cameraActive || !videoRef.current || !streamRef.current) {
      return;
    }

    const videoElement = videoRef.current;
    videoElement.srcObject = streamRef.current;

    void videoElement.play().catch(() => {
      setCameraError("Le flux caméra ne démarre pas. Vérifiez les permissions.");
    });
  }, [cameraActive]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const greenPanelClass =
    "rounded-md border border-[#b6c7ac] bg-[#edf4e7] p-4 shadow-[0_2px_5px_rgba(0,0,0,0.12)]";
  const whitePanelClass =
    "rounded-md border border-[#c4c4c4] bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.12)]";
  const resultCardClass =
    "rounded-md border border-[#c9c9c9] bg-white p-4 text-xs text-[#2c2c2c] shadow-[0_2px_6px_rgba(0,0,0,0.12)]";

  const pageContent = (
    <div className="mx-auto w-full max-w-6xl">
      <div className="max-w-3xl text-[#2c2c2c]">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Analyse nutritionnelle</h1>
        <h2 className="mt-3 text-lg font-semibold">
          {isCoach ? "Scanner un repas ou charger une analyse" : "Scanner un repas"}
        </h2>
        <p className="mt-1 text-xs text-[#555]">
          Importez une photo de votre plat pour obtenir une estimation des ingrédients, des
          quantités et des valeurs nutritionnelles.
        </p>
      </div>

      {isCoach && (
        <section className={`mt-6 ${greenPanelClass}`}>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#2f4a2f]">
            <Users className="h-4 w-4" />
            Modifier l&apos;apport calorique d&apos;une analyse coaché
          </div>
          <p className="mt-1 text-xs text-[#456145]">
            Après que le coaché a sauvegardé et éventuellement recalculé les quantités, chargez son
            repas ci-dessous pour ajuster les calories finales.
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div>
              <label
                htmlFor="coach-select-coachee"
                className="mb-1 block text-[11px] font-medium text-[#456145]"
              >
                Coaché
              </label>
              <select
                id="coach-select-coachee"
                value={selectedCoacheeId}
                onChange={(e) => setSelectedCoacheeId(e.target.value)}
                className="min-w-[180px] rounded-md border border-[#c3d2ba] bg-white px-3 py-2 text-sm text-[#2c2c2c] shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]"
                disabled={recentScannersLoading && coachees.length === 0}
              >
                <option value="">
                  {recentScannersLoading && coachees.length === 0
                    ? "Chargement…"
                    : "Sélectionner un coaché"}
                </option>
                {coachees.map((u) => (
                  <option key={u.userId} value={u.userId}>
                    {u.displayName || u.email}
                  </option>
                ))}
              </select>
            </div>
            {selectedCoacheeId && (
              <div>
                <label
                  htmlFor="coach-data-source"
                  className="mb-1 block text-[11px] font-medium text-[#456145]"
                >
                  Source des données
                </label>
                <select
                  id="coach-data-source"
                  value={dataSource}
                  onChange={(e) => setDataSource(e.target.value as "meals" | "scanner")}
                  className="min-w-[200px] rounded-md border border-[#c3d2ba] bg-white px-3 py-2 text-sm text-[#2c2c2c] shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]"
                >
                  <option value="meals">Repas enregistrés (par défaut)</option>
                  <option value="scanner">Soumissions scanner</option>
                </select>
              </div>
            )}
          </div>
          {selectedCoacheeId && (
            <div className="mt-3">
              {dataSource === "meals" &&
                (mealsLoading ? (
                  <div className="flex items-center gap-2 text-xs text-[#555]">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Chargement des repas...
                  </div>
                ) : coacheeMeals.length === 0 ? (
                  <p className="text-xs text-[#555]">
                    Aucun repas enregistré dans les 3 derniers jours pour ce coaché.
                  </p>
                ) : (
                  <>
                    <div className="mb-2 text-[11px] font-medium text-[#456145]">
                      Repas des 3 derniers jours :
                    </div>
                    <ul className="max-h-40 space-y-2 overflow-y-auto">
                      {coacheeMeals.map((meal) => (
                        <li key={meal.id}>
                          <button
                            type="button"
                            onClick={async () => {
                              const result = await nutritionalAnalysis.loadCoachDishAnalysis(
                                meal.id,
                              );
                              if (result && !result.success) alert(result.message);
                            }}
                            disabled={nutritionalAnalysis.loadingCoachDish}
                            className="flex w-full items-center justify-between gap-2 rounded-md border border-[#cdd6cb] bg-white px-3 py-2 text-left text-[#2c2c2c] shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-colors hover:bg-[#f8fbf6] disabled:opacity-50"
                          >
                            <span className="truncate font-medium">{meal.name}</span>
                            <span className="shrink-0 text-[10px] text-[#555]">
                              {new Date(meal.consumedAt).toLocaleDateString("fr-FR")} ·{" "}
                              {meal.calories} kcal
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                ))}
              {dataSource === "scanner" &&
                (scannerLoading ? (
                  <div className="flex items-center gap-2 text-xs text-[#555]">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Chargement des soumissions scanner...
                  </div>
                ) : scannerSubmissions.length === 0 ? (
                  <div className="space-y-1 text-xs text-[#555]">
                    <p className="font-medium">Aucune soumission scanner pour ce coaché.</p>
                    <p>
                      Les soumissions apparaissent ici lorsque le coaché a utilisé la page
                      &quot;Scan repas&quot;, a lancé une analyse puis a cliqué sur
                      &quot;Enregistrer et envoyer au coach&quot;.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-2 flex items-center gap-1 text-[11px] font-medium text-[#456145]">
                      <FileText className="h-3 w-3" />
                      Soumissions scanner (page repas)
                    </div>
                    <ul className="max-h-40 space-y-2 overflow-y-auto">
                      {scannerSubmissions.map((sub) => {
                        let label = `Soumission du ${new Date(sub.createdAt).toLocaleDateString("fr-FR")}`;
                        try {
                          const payload = JSON.parse(sub.payloadJson) as ScannerCoachPayload;
                          const name =
                            payload.details?.dishName || payload.analysis?.plats_probables?.[0];
                          if (name)
                            label = `${name} · ${new Date(sub.createdAt).toLocaleDateString("fr-FR")}`;
                        } catch {
                          // keep default label
                        }
                        return (
                          <li key={sub.id}>
                            <button
                              type="button"
                              onClick={() => {
                                try {
                                  const payload = JSON.parse(
                                    sub.payloadJson,
                                  ) as ScannerCoachPayload;
                                  nutritionalAnalysis.loadFromScannerPayload(payload, sub.id);
                                  setTimeout(
                                    () =>
                                      analysisPanelRef.current?.scrollIntoView({
                                        behavior: "smooth",
                                        block: "start",
                                      }),
                                    150,
                                  );
                                } catch {
                                  alert("Impossible de charger cette soumission.");
                                }
                              }}
                              className="flex w-full items-center justify-between gap-2 rounded-md border border-[#cdd6cb] bg-white px-3 py-2 text-left text-[#2c2c2c] shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-colors hover:bg-[#f8fbf6]"
                            >
                              <span className="truncate font-medium">{label}</span>
                              <span className="shrink-0 text-[10px] text-[#555]">
                                {new Date(sub.createdAt).toLocaleString("fr-FR")}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                ))}
            </div>
          )}
        </section>
      )}

      <div
        ref={analysisPanelRef}
        className="mt-6 grid gap-5 lg:gap-10 xl:gap-14 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)]"
      >
        <div className="space-y-4 lg:w-full lg:max-w-136 lg:justify-self-start">
          <section className={greenPanelClass}>
            <h2 className="text-sm font-semibold text-[#2f4a2f]">1) Importer une image</h2>
            {nutritionalAnalysis.analysis && nutritionalAnalysis.filePreview ? (
              <div className="mt-3 rounded-md border border-[#c3d2ba] bg-white p-3 text-xs text-[#3c3c3c]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#2f4a2f]">
                    Image prête pour l&apos;analyse
                  </span>
                  {!isCoach && (
                    <>
                      <label
                        htmlFor="meal-image-new"
                        className="inline-flex cursor-pointer items-center rounded px-2 py-1 text-[10px] text-[#1e4a1e] underline transition-all duration-200 hover:scale-[1.02] hover:bg-[#eef4e8] hover:text-[#0f2f0f] hover:shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
                      >
                        Changer l&apos;image
                      </label>
                      <input
                        id="meal-image-new"
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-[#666]">
                  L&apos;aperçu complet est affiché dans le panneau de droite.
                </p>
              </div>
            ) : (
              <div className="mt-3 rounded-md border border-dashed border-[#c9c9c9] bg-[#f5fbf1] p-4 text-xs text-[#3c3c3c]">
                <label
                  htmlFor="meal-image"
                  onPaste={handlePasteArea}
                  className="flex cursor-pointer flex-col items-center justify-center gap-3 py-6 text-center"
                >
                  <UploadCloud className="h-7 w-7 text-[#4a7c4a]" />
                  <span className="block text-sm font-medium">
                    Téléchargez une image en cliquant ici
                  </span>
                  <span className="block text-[11px]">
                    Ou collez directement une image avec Ctrl+V ou Cmd+V.
                  </span>
                  <div className="text-[11px] text-[#666]">
                    Formats supportés : JPG, PNG. Taille max : 10MB (l&apos;image sera
                    automatiquement compressée).
                  </div>

                  <input
                    id="meal-image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {nutritionalAnalysis.fileError && (
              <div className="mt-3 rounded-md bg-[#f7e1e1] px-3 py-2 text-xs text-[#7b2222]">
                {nutritionalAnalysis.fileError}
              </div>
            )}
          </section>

          <section className={greenPanelClass}>
            <h2 className="text-sm font-semibold text-[#2f4a2f]">
              2) Charger une URL d&apos;image
            </h2>
            <form
              className="mt-3 flex flex-col gap-2 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                void handleLoadImageUrl();
              }}
            >
              <input
                type="url"
                value={urlInput}
                onChange={(event) => {
                  setUrlInput(event.target.value);
                  if (urlError) setUrlError(null);
                }}
                placeholder="https://exemple.com/photo.jpg"
                className="w-full rounded-md border border-[#c3d2ba] bg-white px-3 py-2 text-xs text-[#2c2c2c]"
              />
              <button
                type="submit"
                disabled={!hasUrlInput || loadingUrlImage}
                className={`rounded-md px-4 py-2 text-xs font-semibold text-white shadow-[0_2px_4px_rgba(0,0,0,0.18)] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                  hasUrlInput && !loadingUrlImage
                    ? "cursor-pointer bg-[#2f6fdd] hover:scale-[1.02] hover:bg-[#255bb6] hover:shadow-lg"
                    : "bg-[#7ea6eb]"
                }`}
              >
                {loadingUrlImage ? "Chargement..." : "Charger"}
              </button>
            </form>
            {urlError && <p className="mt-2 text-xs text-[#8a2a2a]">{urlError}</p>}
          </section>

          {!nutritionalAnalysis.analysis && (
            <section className={greenPanelClass}>
              <h2 className="text-sm font-semibold text-[#2f4a2f]">3) Prendre une photo</h2>
              {!cameraActive ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="mt-3 cursor-pointer rounded-md bg-[#1d7a42] px-4 py-2 text-xs font-semibold text-white shadow-[0_2px_4px_rgba(0,0,0,0.18)] transition-all duration-200 hover:scale-[1.02] hover:bg-[#279653] hover:shadow-lg"
                >
                  Activer la caméra
                </button>
              ) : (
                <div className="mt-3 space-y-3">
                  <video
                    ref={videoRef}
                    className="h-56 w-full rounded-md border border-[#c3d2ba] bg-black object-cover"
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={() => {
                      setCameraReady(true);
                      setCameraError(null);
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void capturePhoto()}
                      disabled={!cameraReady}
                      className="cursor-pointer rounded-md bg-[#ca1685] px-4 py-2 text-xs font-semibold text-white shadow-[0_2px_4px_rgba(0,0,0,0.18)] transition-all duration-200 hover:scale-[1.02] hover:bg-[#e11d97] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Capturer la photo
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="cursor-pointer rounded-md bg-[#555] px-4 py-2 text-xs font-semibold text-white shadow-[0_2px_4px_rgba(0,0,0,0.18)] transition-all duration-200 hover:scale-[1.02] hover:bg-[#6b6b6b] hover:shadow-lg"
                    >
                      Arrêter la caméra
                    </button>
                  </div>
                  {!cameraReady && (
                    <p className="text-xs text-[#4f4f4f]">Initialisation du flux caméra...</p>
                  )}
                </div>
              )}
              {cameraError && <p className="mt-2 text-xs text-[#8a2a2a]">{cameraError}</p>}
            </section>
          )}

          {nutritionalAnalysis.analyzeError && (
            <div className="rounded-md bg-[#f7e1e1] px-3 py-2 text-xs text-[#7b2222]">
              Impossible d&apos;analyser l&apos;image. Vérifiez votre connexion et réessayez.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <aside className={whitePanelClass}>
            <h2 className="text-sm font-semibold text-[#2c2c2c]">Aperçu</h2>
            <p className="mt-1 text-[11px] text-[#666]">
              {nutritionalAnalysis.filePreview ? "Image sélectionnée" : "Aucune image sélectionnée"}
            </p>
            <div className="mt-3 overflow-hidden rounded-md border border-[#d1d1d1] bg-[#f7f7f7]">
              {nutritionalAnalysis.filePreview ? (
                <div className="max-h-[600px] w-full overflow-auto bg-black/5 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={nutritionalAnalysis.filePreview}
                    alt={nutritionalAnalysis.analysis ? "Plat analysé" : "Aperçu du repas"}
                    className="max-h-[600px] w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-75 items-center justify-center px-3 text-center text-xs text-[#666]">
                  L&apos;aperçu de l&apos;image s&apos;affichera ici.
                </div>
              )}
            </div>
          </aside>

          {!nutritionalAnalysis.analysis && !nutritionalAnalysis.analyzing && (
            <section className={whitePanelClass}>
              <button
                type="button"
                onClick={nutritionalAnalysis.handleAnalyze}
                disabled={!hasLoadedImage}
                className={`w-full rounded-md px-4 py-2 text-xs font-semibold text-white shadow-[0_2px_4px_rgba(0,0,0,0.22)] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                  hasLoadedImage
                    ? "cursor-pointer bg-[#2596be] hover:scale-[1.02] hover:bg-[#1e7a9a] hover:shadow-lg"
                    : "bg-[#86c7db]"
                }`}
              >
                Lancer l&apos;analyse
              </button>
              <p className="mt-2 text-xs text-[#4f5e4f]">
                L&apos;analyse peut prendre quelques secondes.
              </p>
            </section>
          )}

          {nutritionalAnalysis.analyzing && (
            <section className={whitePanelClass}>
              <div className="flex items-center gap-2 text-xs text-[#4f5e4f]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyse en cours de votre repas...
              </div>
            </section>
          )}

          {nutritionalAnalysis.analysis && (
            <div className="space-y-4">
              {nutritionalAnalysis.analysis.dishName && (
                <div className={resultCardClass}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-[#4a7c4a]">Plat identifié</div>
                    {isCoachee && nutritionalAnalysis.savedDishId && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!nutritionalAnalysis.editingDishName) {
                            nutritionalAnalysis.startEditingDishName();
                          } else {
                            nutritionalAnalysis.setEditingDishName(false);
                          }
                        }}
                        className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-[10px] text-[#4a7c4a] transition-all duration-200 hover:scale-[1.02] hover:bg-[#eef4e8] hover:text-[#3a6a3a] hover:shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
                      >
                        <Edit2 className="h-3 w-3" />
                        {nutritionalAnalysis.editingDishName ? "Annuler" : "Modifier"}
                      </button>
                    )}
                  </div>
                  {nutritionalAnalysis.editingDishName &&
                  isCoachee &&
                  nutritionalAnalysis.savedDishId ? (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={nutritionalAnalysis.editedDishName}
                        onChange={(e) => nutritionalAnalysis.setEditedDishName(e.target.value)}
                        className="flex-1 border border-[#c9c9c9] rounded px-2 py-1 text-sm"
                        placeholder="Nom du plat"
                      />
                      <button
                        type="button"
                        onClick={handleUpdateDishName}
                        disabled={
                          nutritionalAnalysis.updatingDishName ||
                          !nutritionalAnalysis.editedDishName.trim()
                        }
                        className="cursor-pointer rounded bg-[#2596be] px-3 py-1 text-xs font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-[#1e7a9a] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {nutritionalAnalysis.updatingDishName ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Sauvegarder"
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 text-base font-bold text-[#2c2c2c]">
                      {nutritionalAnalysis.analysis.dishName}
                    </div>
                  )}
                </div>
              )}

              <div className={resultCardClass}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold">Résumé de l&apos;analyse</div>
                    {nutritionalAnalysis.analysis.mealType && (
                      <div className="mt-1 text-[11px] text-[#555]">
                        Type de repas estimé :{" "}
                        <span className="font-semibold">
                          {nutritionalAnalysis.analysis.mealType}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#15803d] text-xs font-bold text-white">
                    {Math.round(nutritionalAnalysis.analysis.healthScore)}%
                  </div>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-[#444]">
                  {nutritionalAnalysis.analysis.analysisSummary}
                </p>
              </div>

              <div className={`grid gap-3 ${resultCardClass}`}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Valeurs nutritionnelles estimées</div>
                  {isCoach &&
                    (nutritionalAnalysis.savedDishId ||
                      nutritionalAnalysis.scannerSubmissionId) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!nutritionalAnalysis.editingCalories) {
                            nutritionalAnalysis.setEditedCalories(
                              nutritionalAnalysis.analysis?.totalNutrition.calories ?? 0,
                            );
                          }
                          nutritionalAnalysis.setEditingCalories(
                            !nutritionalAnalysis.editingCalories,
                          );
                        }}
                        className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-[10px] text-[#4a7c4a] transition-all duration-200 hover:scale-[1.02] hover:bg-[#eef4e8] hover:text-[#3a6a3a] hover:shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
                      >
                        <Edit2 className="h-3 w-3" />
                        {nutritionalAnalysis.editingCalories ? "Annuler" : "Modifier calories"}
                      </button>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <div className="font-semibold">Calories</div>
                    {nutritionalAnalysis.editingCalories && isCoach ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          value={
                            nutritionalAnalysis.editedCalories ??
                            nutritionalAnalysis.analysis?.totalNutrition.calories ??
                            0
                          }
                          onChange={(e) =>
                            nutritionalAnalysis.setEditedCalories(parseFloat(e.target.value) || 0)
                          }
                          className="w-20 px-2 py-1 border border-[#c9c9c9] rounded text-[11px]"
                        />
                        <span>kcal</span>
                        <button
                          type="button"
                          onClick={handleUpdateCalories}
                          disabled={
                            nutritionalAnalysis.updatingCalories ||
                            nutritionalAnalysis.creatingDishFromScanner
                          }
                          className="cursor-pointer rounded bg-[#2596be] px-2 py-1 text-[10px] text-white transition-all duration-200 hover:scale-[1.02] hover:bg-[#1e7a9a] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {nutritionalAnalysis.updatingCalories ||
                          nutritionalAnalysis.creatingDishFromScanner ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : nutritionalAnalysis.scannerSubmissionId ? (
                            "Créer le repas et enregistrer"
                          ) : (
                            "Sauvegarder"
                          )}
                        </button>
                      </div>
                    ) : (
                      <div>{nutritionalAnalysis.analysis.totalNutrition.calories ?? 0} kcal</div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">Protéines</div>
                    <div>{nutritionalAnalysis.analysis.totalNutrition.protein ?? 0} g</div>
                  </div>
                  <div>
                    <div className="font-semibold">Glucides</div>
                    <div>{nutritionalAnalysis.analysis.totalNutrition.carbs ?? 0} g</div>
                  </div>
                  <div>
                    <div className="font-semibold">Lipides</div>
                    <div>{nutritionalAnalysis.analysis.totalNutrition.fat ?? 0} g</div>
                  </div>
                  <div>
                    <div className="font-semibold">Fibres</div>
                    <div>{nutritionalAnalysis.analysis.totalNutrition.fiber ?? 0} g</div>
                  </div>
                  <div>
                    <div className="font-semibold">Sucre</div>
                    <div>{nutritionalAnalysis.analysis.totalNutrition.sugar ?? 0} g</div>
                  </div>
                  <div>
                    <div className="font-semibold">Sel</div>
                    <div>{nutritionalAnalysis.analysis.totalNutrition.salt ?? 0} g</div>
                  </div>
                </div>
              </div>

              <div className={resultCardClass}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold">Ingrédients identifiés</div>
                  {isCoachee && nutritionalAnalysis.savedDishId && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!nutritionalAnalysis.editingQuantities) {
                          nutritionalAnalysis.startEditingQuantities();
                        } else {
                          nutritionalAnalysis.setEditingQuantities(false);
                        }
                      }}
                      className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-[10px] text-[#4a7c4a] transition-all duration-200 hover:scale-[1.02] hover:bg-[#eef4e8] hover:text-[#3a6a3a] hover:shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
                    >
                      <Edit2 className="h-3 w-3" />
                      {nutritionalAnalysis.editingQuantities ? "Annuler" : "Modifier grammages"}
                    </button>
                  )}
                </div>
                <div className="mt-2 space-y-2">
                  {nutritionalAnalysis.analysis.ingredients.length === 0 && (
                    <div className="text-[11px] text-[#666]">
                      Aucun ingrédient n&apos;a pu être clairement identifié.
                    </div>
                  )}

                  {nutritionalAnalysis.analysis.ingredients.map((ingredient, index) => {
                    const key = `${ingredient.name}-${index}`;
                    const displayQuantity =
                      nutritionalAnalysis.editingQuantities &&
                      nutritionalAnalysis.editedQuantities[key] !== undefined
                        ? nutritionalAnalysis.editedQuantities[key]
                        : (ingredient.estimatedQuantityGrams ?? 0);
                    const editedName =
                      nutritionalAnalysis.editedIngredientNames[key] ?? ingredient.name;

                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-sm bg-[#f5fbf1] px-3 py-2 text-[11px]"
                      >
                        <div className="flex-1">
                          <div className="font-semibold">
                            {nutritionalAnalysis.editingQuantities &&
                            isCoachee &&
                            nutritionalAnalysis.savedDishId ? (
                              <input
                                type="text"
                                value={editedName}
                                onChange={(e) => {
                                  nutritionalAnalysis.setEditedIngredientNames({
                                    ...nutritionalAnalysis.editedIngredientNames,
                                    [key]: e.target.value,
                                  });
                                }}
                                className="w-full max-w-xs px-2 py-1 border border-[#c9c9c9] rounded text-[11px]"
                              />
                            ) : (
                              ingredient.name
                            )}
                          </div>
                          <div className="text-[#555] flex items-center gap-2 mt-1">
                            {nutritionalAnalysis.editingQuantities &&
                            isCoachee &&
                            nutritionalAnalysis.savedDishId ? (
                              <>
                                <input
                                  type="number"
                                  value={displayQuantity}
                                  onChange={(e) => {
                                    const newValue = parseFloat(e.target.value) || 0;
                                    nutritionalAnalysis.setEditedQuantities({
                                      ...nutritionalAnalysis.editedQuantities,
                                      [key]: newValue,
                                    });
                                  }}
                                  className="w-20 px-2 py-1 border border-[#c9c9c9] rounded text-[11px]"
                                  min="0"
                                  step="1"
                                />
                                <span>g</span>
                              </>
                            ) : (
                              <span>
                                {displayQuantity > 0
                                  ? `${Math.round(displayQuantity)} g`
                                  : "Quantité estimée non disponible"}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-[#555]">
                          {ingredient.calories !== undefined && ingredient.calories !== null && (
                            <div>{Math.round(ingredient.calories)} kcal</div>
                          )}
                          {(ingredient.protein || ingredient.carbs || ingredient.fat) && (
                            <div>
                              P: {ingredient.protein ?? 0}g | G: {ingredient.carbs ?? 0}g | L:{" "}
                              {ingredient.fat ?? 0}g
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {nutritionalAnalysis.editingQuantities &&
                  isCoachee &&
                  nutritionalAnalysis.savedDishId && (
                    <>
                      <div className="mt-3 space-y-2">
                        <div className="text-[11px] font-semibold text-[#3f5a3e]">
                          Ajouter un ingrédient manquant
                        </div>
                        {nutritionalAnalysis.extraIngredients.map((extra) => (
                          <div key={extra.id} className="flex items-center gap-2 text-[11px]">
                            <input
                              type="text"
                              value={extra.name}
                              onChange={(e) => {
                                nutritionalAnalysis.setExtraIngredients(
                                  nutritionalAnalysis.extraIngredients.map((item) =>
                                    item.id === extra.id ? { ...item, name: e.target.value } : item,
                                  ),
                                );
                              }}
                              placeholder="Nom de l'ingrédient"
                              className="flex-1 max-w-xs px-2 py-1 border border-[#c9c9c9] rounded"
                            />
                            <input
                              type="number"
                              value={extra.quantityGrams}
                              onChange={(e) => {
                                const newValue = parseFloat(e.target.value) || 0;
                                nutritionalAnalysis.setExtraIngredients(
                                  nutritionalAnalysis.extraIngredients.map((item) =>
                                    item.id === extra.id
                                      ? { ...item, quantityGrams: newValue }
                                      : item,
                                  ),
                                );
                              }}
                              className="w-20 px-2 py-1 border border-[#c9c9c9] rounded"
                              min="0"
                              step="1"
                            />
                            <span>g</span>
                            <button
                              type="button"
                              onClick={() => {
                                nutritionalAnalysis.setExtraIngredients(
                                  nutritionalAnalysis.extraIngredients.filter(
                                    (item) => item.id !== extra.id,
                                  ),
                                );
                              }}
                              className="text-[10px] text-red-600 hover:text-red-800"
                            >
                              Supprimer
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            nutritionalAnalysis.setExtraIngredients([
                              ...nutritionalAnalysis.extraIngredients,
                              {
                                id: crypto.randomUUID(),
                                name: "",
                                quantityGrams: 0,
                              },
                            ]);
                          }}
                          className="text-[11px] text-[#2596be] hover:text-[#1e7a9a]"
                        >
                          + Ajouter un ingrédient
                        </button>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={handleUpdateQuantities}
                          disabled={nutritionalAnalysis.updatingQuantities}
                          className="inline-flex cursor-pointer items-center gap-2 rounded bg-[#2596be] px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-[#1e7a9a] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {nutritionalAnalysis.updatingQuantities ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Recalcul en cours...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              Recalculer et sauvegarder
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}

                {nutritionalAnalysis.analysis.warnings.length > 0 && (
                  <div className="mt-3 rounded-sm bg-[#fff3cd] px-3 py-2 text-[11px] text-gray-900">
                    <div className="text-[11px] font-semibold">Points de vigilance</div>
                    <ul className="mt-1 list-disc pl-4">
                      {nutritionalAnalysis.analysis.warnings.map((warning, index) => (
                        <li
                          key={`${warning}-${
                            // biome-ignore lint/suspicious/noArrayIndexKey: <I do not have a specific id for my warnings>
                            index
                          }`}
                        >
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {isCoachee && !nutritionalAnalysis.savedDishId && (
                <div className="rounded-md border border-[#c9c9c9] bg-white p-4 text-xs text-[#2c2c2c] shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
                  <button
                    type="button"
                    onClick={handleSaveAnalysis}
                    disabled={nutritionalAnalysis.saving}
                    className="w-full inline-flex items-center justify-center gap-2 rounded bg-[#4a7c4a] px-4 py-3 text-sm font-semibold text-white transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:bg-[#3a6a3a] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {nutritionalAnalysis.saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sauvegarde en cours...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Sauvegarder l&apos;analyse
                      </>
                    )}
                  </button>
                  <p className="mt-2 text-[10px] text-[#666] text-center">
                    Une fois sauvegardée, vous pourrez modifier les grammages et recalculer les
                    valeurs nutritionnelles.
                  </p>
                </div>
              )}

              {nutritionalAnalysis.savedDishId && (
                <div className="rounded-md border border-[#4a7c4a] bg-[#f0f9f0] p-3 text-xs text-[#2c2c2c]">
                  <div className="flex items-center gap-2 text-[#4a7c4a] font-semibold">
                    <Save className="h-4 w-4" />
                    Analyse sauvegardée
                  </div>
                  <p className="mt-1 text-[10px] text-[#555]">
                    {isCoachee && "Vous pouvez maintenant modifier les grammages ci-dessus."}
                    {isCoach && "Vous pouvez modifier les calories finales ci-dessus."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (profileLoading) {
    return (
      <CoachLayout pageTitle="Analyse nutritionnelle">
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </CoachLayout>
    );
  }

  if (!profileData?.me) {
    return null;
  }

  if (isCoach) {
    return <CoachLayout pageTitle="Analyse nutritionnelle">{pageContent}</CoachLayout>;
  }

  return (
    <HomeLayout pageTitle="Analyse nutritionnelle" footerVariant="userSlim">
      <UserPageLayout activeNav="analyseIa">{pageContent}</UserPageLayout>
    </HomeLayout>
  );
}
