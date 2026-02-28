import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import HomeLayout from "@/components/HomeLayout";
import UserPageLayout from "@/components/UserPageLayout";
import {
  type ImageSource,
  SCANNER_ANALYSIS_REQUEST_KEY,
  SCANNER_ANALYSIS_RESPONSE_KEY,
  SCANNER_MEAL_DRAFT_KEY,
  type ScannerMealDraft,
} from "@/lib/scannerDraft";
import {
  deleteScannerOriginalImage,
  saveScannerOriginalImage,
} from "@/lib/scannerOriginalImageStore";

const MAX_STORED_IMAGE_DIMENSION = 1_280;
const MIN_STORED_IMAGE_DIMENSION = 768;
const MAX_STORED_IMAGE_DATA_URL_LENGTH = 450_000;
const STORAGE_IMAGE_QUALITY_STEPS = [0.82, 0.74, 0.66, 0.58];

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

const isValidHttpUrl = (value: string): boolean => {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
};

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Data URL invalide"));
    };

    reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
    reader.readAsDataURL(file);
  });
};

const loadImageForStorage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Fenêtre indisponible"));
      return;
    }

    const image = new window.Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Chargement de l'image impossible"));
    image.src = src;
  });
};

const renderImageToCanvas = (
  image: HTMLImageElement,
  width: number,
  height: number,
): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas indisponible");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);

  return canvas;
};

const optimizeImageForStorage = async (src: string): Promise<string> => {
  if (src.startsWith("data:image/") && src.length <= MAX_STORED_IMAGE_DATA_URL_LENGTH) {
    return src;
  }

  const image = await loadImageForStorage(src);
  const largestSide = Math.max(image.naturalWidth, image.naturalHeight);

  if (largestSide === 0) {
    throw new Error("Image vide");
  }

  const initialScale = Math.min(1, MAX_STORED_IMAGE_DIMENSION / largestSide);
  let width = Math.max(1, Math.round(image.naturalWidth * initialScale));
  let height = Math.max(1, Math.round(image.naturalHeight * initialScale));
  let bestCandidate = "";

  while (true) {
    const canvas = renderImageToCanvas(image, width, height);

    for (const quality of STORAGE_IMAGE_QUALITY_STEPS) {
      const candidate = canvas.toDataURL("image/jpeg", quality);
      bestCandidate = candidate;

      if (candidate.length <= MAX_STORED_IMAGE_DATA_URL_LENGTH) {
        return candidate;
      }
    }

    const currentLargestSide = Math.max(width, height);
    if (currentLargestSide <= MIN_STORED_IMAGE_DIMENSION) {
      return bestCandidate;
    }

    const nextLargestSide = Math.max(
      MIN_STORED_IMAGE_DIMENSION,
      Math.round(currentLargestSide * 0.82),
    );
    const resizeRatio = nextLargestSide / currentLargestSide;
    width = Math.max(1, Math.round(width * resizeRatio));
    height = Math.max(1, Math.round(height * resizeRatio));
  }
};

const isStorageQuotaError = (error: unknown): boolean => {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
};

const getFileNameFromUrl = (value: string): string | null => {
  try {
    const parsedUrl = new URL(value);
    const segments = parsedUrl.pathname.split("/").filter(Boolean);
    if (segments.length === 0) {
      return null;
    }

    const name = decodeURIComponent(segments[segments.length - 1]);
    return name || null;
  } catch {
    return null;
  }
};

export default function ScannerRepasPage() {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [source, setSource] = useState<ImageSource | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const objectUrlRef = useRef<string | null>(null);
  const imageFileRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const releaseObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraReady(false);
    setCameraActive(false);
  }, []);

  const setImageFromFile = useCallback(
    (file: File, imageSource: ImageSource) => {
      if (!file.type.startsWith("image/")) {
        setUrlError("Le fichier sélectionné n'est pas une image.");
        return;
      }

      releaseObjectUrl();
      const nextObjectUrl = URL.createObjectURL(file);
      objectUrlRef.current = nextObjectUrl;
      imageFileRef.current = file;
      setPreviewUrl(nextObjectUrl);
      setSource(imageSource);
      setFileName(file.name || null);
      setUrlError(null);
      setSaveError(null);
    },
    [releaseObjectUrl],
  );

  const clearImage = useCallback(() => {
    releaseObjectUrl();
    imageFileRef.current = null;
    void deleteScannerOriginalImage();
    setPreviewUrl(null);
    setSource(null);
    setFileName(null);
    setUrlError(null);
    setSaveError(null);
  }, [releaseObjectUrl]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    setImageFromFile(selectedFile, "fichier");
    event.target.value = "";
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handlePasteArea = (event: React.ClipboardEvent<HTMLButtonElement>) => {
    const imageFile = getClipboardImageFile(event.clipboardData.items);
    if (!imageFile) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setImageFromFile(imageFile, "collage");
  };

  const handleLoadUrl = useCallback(() => {
    const trimmedUrl = urlInput.trim();

    if (!trimmedUrl) {
      setUrlError("Collez une URL d'image avant de charger.");
      return;
    }

    if (!isValidHttpUrl(trimmedUrl)) {
      setUrlError("URL invalide. Utilisez un lien http:// ou https://.");
      return;
    }

    releaseObjectUrl();
    imageFileRef.current = null;
    setPreviewUrl(trimmedUrl);
    setSource("url");
    setFileName(getFileNameFromUrl(trimmedUrl));
    setUrlError(null);
    setSaveError(null);
  }, [releaseObjectUrl, urlInput]);

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
    const previewObjectUrl = URL.createObjectURL(capturedFile);

    releaseObjectUrl();
    objectUrlRef.current = previewObjectUrl;
    imageFileRef.current = capturedFile;
    setPreviewUrl(previewObjectUrl);
    setSource("camera");
    setFileName(capturedFile.name);
    setUrlError(null);
    setSaveError(null);
  }, [cameraReady, releaseObjectUrl]);

  const handleSaveDraft = useCallback(async () => {
    if (!previewUrl || !source) {
      setSaveError("Ajoutez une image avant d'enregistrer.");
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    try {
      let imageToStore = "";
      const savedAt = new Date().toISOString();

      if (source === "url") {
        if (!isValidHttpUrl(previewUrl)) {
          throw new Error("URL invalide");
        }

        await deleteScannerOriginalImage();
        imageToStore = previewUrl;
      } else {
        const originalImage = imageFileRef.current;
        if (!originalImage) {
          throw new Error("Image originale indisponible");
        }

        imageToStore = await optimizeImageForStorage(previewUrl);
        await saveScannerOriginalImage({
          blob: originalImage,
          fileName: fileName?.trim() || undefined,
          mimeType: originalImage.type || "image/jpeg",
          savedAt,
          source,
        });

        if (!imageToStore.startsWith("data:image/")) {
          imageToStore = await readFileAsDataUrl(originalImage);
        }
      }

      const cleanedFileName = fileName?.trim();

      const draft: ScannerMealDraft = {
        imageUrl: imageToStore,
        source,
        savedAt,
        fileName: cleanedFileName || undefined,
      };

      if (typeof window === "undefined") {
        throw new Error("Storage indisponible");
      }

      window.sessionStorage.removeItem(SCANNER_ANALYSIS_REQUEST_KEY);
      window.sessionStorage.removeItem(SCANNER_ANALYSIS_RESPONSE_KEY);
      window.sessionStorage.removeItem(SCANNER_MEAL_DRAFT_KEY);
      window.sessionStorage.setItem(SCANNER_MEAL_DRAFT_KEY, JSON.stringify(draft));
      await router.push("/meals_scanning_details");
    } catch (error) {
      if (isStorageQuotaError(error)) {
        setSaveError("Cette photo reste trop lourde pour être stockée sur cet appareil.");
        return;
      }

      setSaveError("Impossible d'enregistrer cette image. Réessayez avec une autre photo.");
    } finally {
      setIsSaving(false);
    }
  }, [fileName, previewUrl, router, source]);

  useEffect(() => {
    const handleGlobalPaste = (event: ClipboardEvent) => {
      const imageFile = getClipboardImageFile(event.clipboardData?.items ?? null);
      if (!imageFile) {
        return;
      }

      event.preventDefault();
      setImageFromFile(imageFile, "collage");
    };

    window.addEventListener("paste", handleGlobalPaste);

    return () => {
      window.removeEventListener("paste", handleGlobalPaste);
    };
  }, [setImageFromFile]);

  useEffect(() => {
    return () => {
      stopCamera();
      releaseObjectUrl();
    };
  }, [releaseObjectUrl, stopCamera]);

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

  return (
    <HomeLayout pageTitle="Scanner un repas" footerVariant="userSlim">
      <UserPageLayout activeNav="aiAssist">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-3xl text-[#2c2c2c]">
            <h1 className="text-lg font-semibold">Scanner un repas</h1>
            <p className="mt-1 text-xs text-[#555]">
              Cette page accepte une image collée, une URL de photo, un fichier local et la caméra
              si le dispositif le permet.
            </p>
          </div>

          <div className="mt-6 grid gap-5 lg:gap-10 xl:gap-14 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)]">
            <div className="space-y-4 lg:w-full lg:max-w-136 lg:justify-self-start">
              <section className="rounded-md border border-[#b6c7ac] bg-[#edf4e7] p-4 shadow-[0_2px_5px_rgba(0,0,0,0.12)]">
                <h2 className="text-sm font-semibold text-[#2f4a2f]">1) Importer une image</h2>
                <input
                  id="scan-file-input"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="sr-only"
                />

                <button
                  type="button"
                  onClick={openFilePicker}
                  onPaste={handlePasteArea}
                  className="mt-3 w-full rounded-md border border-dashed border-[#7ea07e] bg-white px-3 py-4 text-center text-[#456145] transition-colors hover:bg-[#f6fbf3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5d875d]"
                >
                  <span className="block text-xs font-semibold">
                    Téléchargez une image en cliquant ici
                  </span>
                  <span className="mt-1 block text-[11px]">
                    Ou collez directement une image avec Ctrl+V ou Cmd+V.
                  </span>
                </button>
              </section>

              <section className="rounded-md border border-[#b6c7ac] bg-[#edf4e7] p-4 shadow-[0_2px_5px_rgba(0,0,0,0.12)]">
                <h2 className="text-sm font-semibold text-[#2f4a2f]">2) Charger une URL d'image</h2>
                <form
                  className="mt-3 flex flex-col gap-2 sm:flex-row"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleLoadUrl();
                  }}
                >
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(event) => setUrlInput(event.target.value)}
                    placeholder="https://exemple.com/photo.jpg"
                    className="w-full rounded-md border border-[#c3d2ba] bg-white px-3 py-2 text-xs text-[#2c2c2c]"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-[#2f6fdd] px-4 py-2 text-xs font-semibold text-white shadow-[0_2px_4px_rgba(0,0,0,0.18)]"
                  >
                    Charger
                  </button>
                </form>
                {urlError && <p className="mt-2 text-xs text-[#8a2a2a]">{urlError}</p>}
              </section>

              <section className="rounded-md border border-[#b6c7ac] bg-[#edf4e7] p-4 shadow-[0_2px_5px_rgba(0,0,0,0.12)]">
                <h2 className="text-sm font-semibold text-[#2f4a2f]">3) Prendre une photo</h2>
                {!cameraActive ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="mt-3 rounded-md bg-[#1d7a42] px-4 py-2 text-xs font-semibold text-white shadow-[0_2px_4px_rgba(0,0,0,0.18)]"
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
                        onClick={capturePhoto}
                        disabled={!cameraReady}
                        className="rounded-md bg-[#ca1685] px-4 py-2 text-xs font-semibold text-white shadow-[0_2px_4px_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        Capturer la photo
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="rounded-md bg-[#555] px-4 py-2 text-xs font-semibold text-white shadow-[0_2px_4px_rgba(0,0,0,0.18)]"
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
            </div>

            <aside className="rounded-md border border-[#c4c4c4] bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
              <h2 className="text-sm font-semibold text-[#2c2c2c]">Aperçu</h2>
              <p className="mt-1 text-[11px] text-[#666]">
                {source ? `Source active: ${source}` : "Aucune image sélectionnée"}
              </p>

              <div className="mt-3 overflow-hidden rounded-md border border-[#d1d1d1] bg-[#f7f7f7]">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Aperçu du repas"
                    width={1200}
                    height={900}
                    unoptimized
                    loader={({ src }) => src}
                    className="h-75 w-full object-cover"
                    onError={() => {
                      if (source === "url") {
                        setUrlError("Impossible de charger cette URL d'image.");
                      }
                    }}
                  />
                ) : (
                  <div className="flex h-75 items-center justify-center px-3 text-center text-xs text-[#666]">
                    L'aperçu de l'image s'affichera ici.
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={clearImage}
                className="mt-3 w-full rounded-md bg-[#2c2c2c] px-3 py-2 text-xs font-semibold text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
              >
                Effacer l'image
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={!previewUrl || isSaving}
                className="mt-2 w-full rounded-md bg-[#1d7a42] px-3 py-2 text-xs font-semibold text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </button>
              {saveError && <p className="mt-2 text-xs text-[#8a2a2a]">{saveError}</p>}
            </aside>
          </div>

          <section className="mt-6 rounded-md border border-[#c8d9c7] bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
            <h2 className="text-sm font-semibold text-[#2c2c2c]">Conseils pour un bon scan</h2>
            <p className="mt-2 text-xs text-[#4f5e4f]">
              Cadre l&apos;assiette en entier, garde une bonne lumière, puis ajoute le nom du plat
              et les ingrédients si tu les connais.
            </p>
            <div className="mt-3 grid gap-2 text-[11px] text-[#3f4d3f] sm:grid-cols-3">
              <div className="rounded border border-[#d8e3d2] bg-[#f8fbf6] px-2 py-2">
                Photo nette et centrée
              </div>
              <div className="rounded border border-[#d8e3d2] bg-[#f8fbf6] px-2 py-2">
                Eviter les filtres/contre-jour
              </div>
              <div className="rounded border border-[#d8e3d2] bg-[#f8fbf6] px-2 py-2">
                Portions visibles au maximum
              </div>
            </div>
          </section>
        </div>
      </UserPageLayout>
    </HomeLayout>
  );
}
