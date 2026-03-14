import type { CoachUserDetailQuery } from "@/graphql/generated/schema";
import {
  UserRole,
  useCoachUserDetailQuery,
  useProfileQuery,
} from "@/graphql/generated/schema";
import {
  Activity,
  ArrowLeft,
  Loader2,
  Mail,
  Scale,
  Stethoscope,
  Target,
  UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import CoachLayout from "@/components/coach/CoachLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EvolutionPoint = NonNullable<
  NonNullable<CoachUserDetailQuery["coachUserDetail"]>["evolutionData"]
>[number];

const chartWidth = 760;
const chartHeight = 170;
const paddingX = 34;
const paddingY = 20;

export default function CoachUserDetailPage() {
  const router = useRouter();
  const userId = router.query.userId as string | undefined;

  const { data: profileData, loading: profileLoading } = useProfileQuery({
    fetchPolicy: "cache-and-network",
  });

  const { data, loading, error } = useCoachUserDetailQuery({
    skip: !userId,
    variables: { userId: userId ?? "" },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (!profileLoading) {
      if (!profileData?.me) {
        router.push("/login");
      } else if (
        profileData.me.role !== UserRole.Coach &&
        profileData.me.role !== UserRole.Admin
      ) {
        router.push("/");
      }
    }
  }, [profileData, profileLoading, router]);

  if (profileLoading || !userId) {
    return (
      <CoachLayout pageTitle="Détail utilisateur">
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </CoachLayout>
    );
  }

  if (!profileData?.me || (profileData.me.role !== UserRole.Coach && profileData.me.role !== UserRole.Admin)) {
    return null;
  }

  if (loading && !data?.coachUserDetail) {
    return (
      <CoachLayout pageTitle="Détail utilisateur">
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </CoachLayout>
    );
  }

  const detail = data?.coachUserDetail;
  if (error || !detail) {
    return (
      <CoachLayout pageTitle="Détail utilisateur">
        <div className="bg-light-bg p-6">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/coach/users"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux utilisateurs
            </Link>
            <p className="text-destructive">
              {error ? error.message : "Utilisateur introuvable ou accès refusé."}
            </p>
          </div>
        </div>
      </CoachLayout>
    );
  }

  const evolutionData = detail.evolutionData ?? [];
  const hasEvolution = evolutionData.length > 0;
  const weights = hasEvolution ? evolutionData.map((p: EvolutionPoint) => p.weight) : [0, 1];
  const minWeight = Math.min(...weights) - 0.4;
  const maxWeight = Math.max(...weights) + 0.4;
  const chartInnerHeight = chartHeight - paddingY * 2;
  const chartInnerWidth = chartWidth - paddingX * 2;

  const getX = (index: number) =>
    evolutionData.length <= 1
      ? paddingX + chartInnerWidth / 2
      : paddingX + (index / (evolutionData.length - 1)) * chartInnerWidth;

  const getY = (weight: number) =>
    paddingY + ((maxWeight - weight) / (maxWeight - minWeight)) * chartInnerHeight;

  const linePoints = evolutionData.map(
    (point: EvolutionPoint, index: number) => `${getX(index)},${getY(point.weight)}`,
  );
  const areaPoints = [
    ...linePoints,
    `${getX(evolutionData.length - 1)},${chartHeight - paddingY}`,
    `${getX(0)},${chartHeight - paddingY}`,
  ].join(" ");

  const yTicks = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4;
    const value = maxWeight - ratio * (maxWeight - minWeight);
    return { y: paddingY + ratio * chartInnerHeight, value };
  });

  return (
    <CoachLayout pageTitle={`${detail.displayName} – Détail`}>
      <div className="bg-light-bg py-6 md:py-8 px-4 md:px-6 flex-1">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/coach/users"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux utilisateurs
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{detail.displayName}</h1>
              <p className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Mail className="h-4 w-4" />
                {detail.email}
              </p>
            </div>
          </div>

          {/* Mensuration + IMC + Objectif + Pathologies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Mensuration
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>
                  <span className="text-muted-foreground">Taille : </span>
                  {detail.height != null ? `${detail.height} cm` : "–"}
                </p>
                <p className="mt-1">
                  <span className="text-muted-foreground">Poids actuel : </span>
                  {detail.currentWeight != null ? `${detail.currentWeight} kg` : "–"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  IMC
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {detail.imc != null ? detail.imc : "–"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {detail.imc != null && detail.imc > 0
                    ? detail.imc < 18.5
                      ? "Insuffisance pondérale"
                      : detail.imc < 25
                        ? "Normal"
                        : detail.imc < 30
                          ? "Surpoids"
                          : "Obésité"
                    : "Calculé à partir du poids et de la taille"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Objectif
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{detail.goal ?? "–"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Pathologies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {detail.pathologies.length > 0 ? (
                  <ul className="text-sm list-disc list-inside space-y-0.5">
                    {detail.pathologies.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune renseignée</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Courbe d'évolution (même vue que l'utilisateur) */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Évolution du poids (vue utilisateur)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Même courbe que celle visible par le coaché sur son espace.
              </p>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  role="img"
                  aria-label="Évolution du poids"
                  className="w-full min-w-[280px]"
                >
                  {yTicks.map((tick) => (
                    <g key={tick.value}>
                      <line
                        x1={paddingX}
                        y1={tick.y}
                        x2={chartWidth - paddingX}
                        y2={tick.y}
                        stroke="#d8e5d7"
                        strokeWidth="1"
                      />
                      <text
                        x="4"
                        y={tick.y + 4}
                        fill="#5a6c59"
                        fontSize="11"
                        className="font-medium"
                      >
                        {tick.value.toFixed(1)}
                      </text>
                    </g>
                  ))}
                  <polyline fill="rgba(122,147,120,0.18)" points={areaPoints} />
                  <polyline
                    fill="none"
                    stroke="#2f6c4c"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={linePoints.join(" ")}
                  />
                  {evolutionData.map((point: EvolutionPoint, index: number) => (
                    <g key={`${point.week}-${index}`}>
                      <circle
                        cx={getX(index)}
                        cy={getY(point.weight)}
                        r="4.5"
                        fill="#2f6c4c"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <text
                        x={getX(index)}
                        y={chartHeight - 8}
                        textAnchor="middle"
                        fill="#4c5a4b"
                        fontSize="11"
                      >
                        {point.week}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
              {!hasEvolution && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Aucune donnée d&apos;évolution pour le moment.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Repas du jour */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5" />
                Repas du jour
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Repas enregistrés aujourd&apos;hui par le coaché.
              </p>
            </CardHeader>
            <CardContent>
              {detail.todayMeals.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  Aucun repas enregistré aujourd&apos;hui.
                </p>
              ) : (
                <ul className="space-y-4">
                  {detail.todayMeals.map((meal) => (
                    <li
                      key={meal.id}
                      className="flex flex-col sm:flex-row gap-3 p-3 rounded-lg border bg-card"
                    >
                      <div className="relative w-full sm:w-24 h-24 rounded-md overflow-hidden bg-muted shrink-0">
                        <Image
                          src={meal.photo}
                          alt={meal.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{meal.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(meal.consumedAt).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-sm mt-1">
                          {meal.calories} kcal · P {meal.protein} · G {meal.carbs} · L {meal.fat} ·
                          Score {meal.aiScore}%
                        </p>
                        {meal.aiInsights.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {meal.aiInsights[0]}
                          </p>
                        )}
                        {meal.coachComment && (
                          <p className="text-xs mt-1 italic text-muted-foreground">
                            Coach : {meal.coachComment}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </CoachLayout>
  );
}
