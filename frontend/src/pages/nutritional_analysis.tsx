import { Edit2, FileText, Loader2, Save, UploadCloud, Users } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
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

// Page for uploading meal photos and displaying nutritional analysis results
export default function NutritionalAnalysisPage() {
  const router = useRouter();
  const [selectedCoacheeId, setSelectedCoacheeId] = useState<string>("");
  const [dataSource, setDataSource] = useState<"meals" | "scanner">("meals");
  const analysisPanelRef = useRef<HTMLDivElement | null>(null);

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

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    nutritionalAnalysis.handleFileChange(file);
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

  const pageContent = (
    <div className="bg-light-bg py-6 md:py-8 px-4 md:px-6 flex-1">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
            Analyse nutritionnelle
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Importez une photo de votre plat pour obtenir une estimation des ingrédients, des
            quantités et des valeurs nutritionnelles.
          </p>
        </div>

        {/* Coach: charger l'analyse d'un coaché pour modifier les calories */}
        {isCoach && (
          <div className="mb-6 rounded-md border border-[#c9c9c9] bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#2c2c2c] mb-3">
              <Users className="h-4 w-4" />
              Modifier l&apos;apport calorique d&apos;une analyse coaché
            </div>
            <p className="text-xs text-[#555] mb-3">
              Après que le coaché a sauvegardé et éventuellement recalculé les quantités, chargez
              son repas ci-dessous pour ajuster les calories finales.
            </p>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label
                  htmlFor="coach-select-coachee"
                  className="block text-[11px] font-medium text-[#555] mb-1"
                >
                  Coaché
                </label>
                <select
                  id="coach-select-coachee"
                  value={selectedCoacheeId}
                  onChange={(e) => setSelectedCoacheeId(e.target.value)}
                  className="border border-[#c9c9c9] rounded px-3 py-2 text-sm min-w-[180px] cursor-pointer"
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
                    className="block text-[11px] font-medium text-[#555] mb-1"
                  >
                    Source des données
                  </label>
                  <select
                    id="coach-data-source"
                    value={dataSource}
                    onChange={(e) => setDataSource(e.target.value as "meals" | "scanner")}
                    className="border border-[#c9c9c9] rounded px-3 py-2 text-sm min-w-[200px] cursor-pointer"
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
                      <div className="text-[11px] font-medium text-[#555] mb-2">
                        Repas des 3 derniers jours :
                      </div>
                      <ul className="space-y-1 max-h-40 overflow-y-auto">
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
                              className="w-full text-left px-3 py-2 rounded bg-[#f5fbf1] hover:bg-[#e8f3e4] text-[#2c2c2c] disabled:opacity-50 flex items-center justify-between gap-2"
                            >
                              <span className="font-medium truncate">{meal.name}</span>
                              <span className="text-[10px] text-[#555] shrink-0">
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
                    <div className="text-xs text-[#555] space-y-1">
                      <p className="font-medium">Aucune soumission scanner pour ce coaché.</p>
                      <p>
                        Les soumissions apparaissent ici lorsque le coaché a utilisé la page
                        &quot;Scan repas&quot;, a lancé une analyse puis a cliqué sur
                        &quot;Enregistrer et envoyer au coach&quot;.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="text-[11px] font-medium text-[#555] mb-2 flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Soumissions scanner (page repas) — cliquer pour afficher l&apos;analyse
                        ci-dessous :
                      </div>
                      <ul className="space-y-1 max-h-40 overflow-y-auto">
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
                                    // Afficher l’analyse (souvent en dessous) après le rendu
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
                                className="w-full text-left px-3 py-2 rounded bg-[#f0f4ff] hover:bg-[#e0e8ff] text-[#2c2c2c] flex items-center justify-between gap-2"
                              >
                                <span className="font-medium truncate">{label}</span>
                                <span className="text-[10px] text-[#555] shrink-0">
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
          </div>
        )}

        {/* Main Content Grid */}
        <div
          ref={analysisPanelRef}
          className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
        >
          <div className="space-y-4">
            {nutritionalAnalysis.analysis && nutritionalAnalysis.filePreview ? (
              <div className="overflow-hidden rounded-md border border-[#c9c9c9] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
                <div className="bg-[#f1f5ee] px-3 py-2 text-[11px] font-semibold text-[#3c3c3c] flex items-center justify-between">
                  <span>Plat analysé</span>
                  {!isCoach && (
                    <>
                      <label
                        htmlFor="meal-image-new"
                        className="cursor-pointer text-[#1e4a1e] hover:text-[#0f2f0f] underline text-[10px]"
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
                <div className="max-h-[600px] w-full overflow-auto bg-black/5 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={nutritionalAnalysis.filePreview}
                    alt="Plat analysé"
                    className="max-h-[600px] w-auto object-contain"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-md border border-dashed border-[#c9c9c9] bg-[#f5fbf1] p-4 text-xs text-[#3c3c3c]">
                  <label
                    htmlFor="meal-image"
                    className="flex cursor-pointer flex-col items-center justify-center gap-3 py-6 text-center"
                  >
                    <UploadCloud className="h-7 w-7 text-[#4a7c4a]" />
                    <div className="text-sm font-medium">
                      Déposez une image ici ou cliquez pour sélectionner un fichier
                    </div>
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

                {nutritionalAnalysis.fileError && (
                  <div className="rounded-md bg-[#f7e1e1] px-3 py-2 text-xs text-[#7b2222]">
                    {nutritionalAnalysis.fileError}
                  </div>
                )}

                {nutritionalAnalysis.filePreview && !nutritionalAnalysis.analysis && (
                  <div className="overflow-hidden rounded-md border border-[#c9c9c9] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
                    <div className="bg-[#f1f5ee] px-3 py-2 text-[11px] font-semibold text-[#3c3c3c]">
                      Aperçu du plat
                    </div>
                    <div className="max-h-[600px] w-full overflow-auto bg-black/5 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={nutritionalAnalysis.filePreview}
                        alt="Aperçu du repas"
                        className="max-h-[600px] w-auto object-contain"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {!nutritionalAnalysis.analysis && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={nutritionalAnalysis.handleAnalyze}
                  disabled={!nutritionalAnalysis.fileBase64 || nutritionalAnalysis.analyzing}
                  className="inline-flex items-center justify-center rounded-md bg-[#2596be] px-4 py-2 text-xs font-semibold text-white shadow-[0_2px_4px_rgba(0,0,0,0.22)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  {nutritionalAnalysis.analyzing && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                  )}
                  Lancer l&apos;analyse
                </button>

                <span className="text-[11px] text-[#666]">
                  L&apos;analyse peut prendre quelques secondes.
                </span>
              </div>
            )}

            {nutritionalAnalysis.analyzeError && (
              <div className="rounded-md bg-[#f7e1e1] px-3 py-2 text-xs text-[#7b2222]">
                Impossible d&apos;analyser l&apos;image. Vérifiez votre connexion et réessayez.
              </div>
            )}
          </div>

          <div className="space-y-4">
            {!nutritionalAnalysis.analysis && !nutritionalAnalysis.analyzing && (
              <div className="rounded-md bg-[#eef4e8] px-3 py-2 text-xs text-gray-800">
                Importez une photo puis lancez l&apos;analyse pour voir ici les résultats détaillés.
              </div>
            )}

            {nutritionalAnalysis.analyzing && (
              <div className="rounded-md bg-[#eef4e8] px-3 py-2 text-xs text-gray-800">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyse en cours de votre repas...
                </div>
              </div>
            )}

            {nutritionalAnalysis.analysis && (
              <div className="space-y-4">
                {nutritionalAnalysis.analysis.dishName && (
                  <div className="rounded-md border border-[#c9c9c9] bg-white p-4 text-xs text-[#2c2c2c] shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
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
                          className="flex items-center gap-1 text-[10px] text-[#4a7c4a] hover:text-[#3a6a3a]"
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
                          className="px-3 py-1 bg-[#2596be] text-white rounded text-xs font-semibold hover:bg-[#1e7a9a] disabled:opacity-50"
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

                <div className="rounded-md border border-[#c9c9c9] bg-white p-4 text-xs text-[#2c2c2c] shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
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

                <div className="grid gap-3 rounded-md border border-[#c9c9c9] bg-white p-4 text-xs text-[#2c2c2c] shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
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
                          className="flex items-center gap-1 text-[10px] text-[#4a7c4a] hover:text-[#3a6a3a]"
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
                            className="px-2 py-1 bg-[#2596be] text-white rounded text-[10px] hover:bg-[#1e7a9a] disabled:opacity-50"
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

                <div className="rounded-md border border-[#c9c9c9] bg-white p-4 text-xs text-[#2c2c2c] shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
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
                        className="flex items-center gap-1 text-[10px] text-[#4a7c4a] hover:text-[#3a6a3a]"
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
                                      item.id === extra.id
                                        ? { ...item, name: e.target.value }
                                        : item,
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
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2596be] text-white rounded text-xs font-semibold hover:bg-[#1e7a9a] disabled:opacity-50"
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
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#4a7c4a] text-white rounded text-sm font-semibold hover:bg-[#3a6a3a] disabled:opacity-50"
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
