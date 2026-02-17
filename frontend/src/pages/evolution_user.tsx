import { gql } from "@apollo/client/core";
import { useQuery } from "@apollo/client/react";
import HomeLayout from "@/components/HomeLayout";
import UserPageLayout from "@/components/UserPageLayout";

const USER_EVOLUTION_QUERY = gql`
  query UserEvolutionData {
    userEvolutionData {
      week
      weight
      calories
      score
    }
  }
`;

type EvolutionPoint = {
  week: string;
  weight: number;
  calories: number;
  score: number;
};

type EvolutionQueryData = {
  userEvolutionData: EvolutionPoint[];
  userEvolutionSummaryData?: EvolutionSummary | null;
};

type EvolutionSummary = {
  startWeight: number;
  currentWeight: number;
  totalLoss: number;
  averageScore: number;
  averageCalories: number;
  weeksCount: number;
  targetWeight?: number | null;
  targetProgress?: number | null;
  remainingToGoal?: number | null;
};

const chartWidth = 560;
const chartHeight = 230;
const paddingX = 34;
const paddingY = 24;

export default function EvolutionUserPage() {
  const { data, loading, error } = useQuery<EvolutionQueryData>(USER_EVOLUTION_QUERY, {
    fetchPolicy: "cache-and-network",
  });

  const evolutionData = data?.userEvolutionData ?? [];
  const hasData = evolutionData.length > 0;
  const summary = data?.userEvolutionSummaryData;
  const firstPoint = evolutionData[0];
  const lastPoint = evolutionData[evolutionData.length - 1];
  const startWeight = summary?.startWeight ?? firstPoint?.weight ?? 0;
  const currentWeight = summary?.currentWeight ?? lastPoint?.weight ?? 0;
  const totalLoss =
    summary?.totalLoss ?? (hasData ? Number((startWeight - currentWeight).toFixed(1)) : 0);
  const totalLossDisplay =
    totalLoss > 0 ? `-${totalLoss}` : totalLoss < 0 ? `+${Math.abs(totalLoss)}` : "0";
  const averageScore = summary?.averageScore ?? 0;
  const averageCalories = summary?.averageCalories ?? 0;
  const weeksCount = summary?.weeksCount ?? evolutionData.length;
  const targetWeight = summary?.targetWeight ?? null;
  const remainingToGoal = summary?.remainingToGoal ?? null;

  const weights = hasData ? evolutionData.map((point: EvolutionPoint) => point.weight) : [0, 1];
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
    <HomeLayout pageTitle="Mon evolution">
      <UserPageLayout activeNav="evolution">
        {loading && (
          <div className="rounded-md bg-[#eef4e8] px-3 py-2 text-xs text-[#3c3c3c]">
            Chargement de vos donnees...
          </div>
        )}

        {error && (
          <div className="rounded-md bg-[#f7e1e1] px-3 py-2 text-xs text-[#7b2222]">
            Donnees indisponibles. Verifie que vous etes bien connecte(e).
          </div>
        )}

        <div className="max-w-3xl text-[#2c2c2c]">
          <h1 className="text-lg font-semibold">Mon evolution sur 6 semaines</h1>
          <p className="mt-1 text-xs text-[#555]">
            Vue d&apos;ensemble de ta progression poids, calories et score sante.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md bg-[#bfe8ea] px-3 py-3 text-[#1d3d45] shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
            <div className="text-xs uppercase tracking-wide">Poids actuel</div>
            <div className="mt-1 text-lg font-semibold">{currentWeight} kg</div>
            <div className="text-[11px]">Depart: {startWeight} kg</div>
          </div>
          <div className="rounded-md bg-[#a7d9a1] px-3 py-3 text-[#214021] shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
            <div className="text-xs uppercase tracking-wide">Variation totale</div>
            <div className="mt-1 text-lg font-semibold">{totalLossDisplay} kg</div>
            <div className="text-[11px]">
              {targetWeight !== null && remainingToGoal !== null
                ? `Objectif: ${targetWeight} kg | Reste: ${remainingToGoal} kg`
                : `Sur ${weeksCount} semaines`}
            </div>
          </div>
          <div className="rounded-md bg-[#e9b26b] px-3 py-3 text-[#4a2a10] shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
            <div className="text-xs uppercase tracking-wide">Score sante moyen</div>
            <div className="mt-1 text-lg font-semibold">{averageScore}%</div>
            <div className="text-[11px]">Calories moyennes: {averageCalories} kcal</div>
          </div>
        </div>

        <section className="mt-6 rounded-md border border-[#c8d9c7] bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#2c2c2c]">Evolution du poids (kg)</h2>
          </div>

          <div className="mt-4">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              role="img"
              aria-label="Graphique d evolution du poids"
              className="w-full"
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
                  <text x="4" y={tick.y + 4} fill="#5a6c59" fontSize="11" className="font-medium">
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
                <g key={point.week}>
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

            {!hasData && (
              <p className="mt-3 text-xs text-[#5a6c59]">
                Aucune donnee d evolution disponible pour le moment.
              </p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-md bg-[#89c689] p-4 text-[#1f3d1f] shadow-[0_3px_6px_rgba(0,0,0,0.2)]">
          <h2 className="text-sm font-semibold">Details hebdomadaires</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-110 text-left text-[11px]">
              <thead>
                <tr className="border-b border-[#1f3d1f]/25 text-[10px] uppercase tracking-wide">
                  <th className="pb-2 pr-2">Semaine</th>
                  <th className="pb-2 pr-2">Poids</th>
                  <th className="pb-2 pr-2">Calories moy.</th>
                  <th className="pb-2">Score sante</th>
                </tr>
              </thead>
              <tbody>
                {evolutionData.map((point: EvolutionPoint) => (
                  <tr key={point.week} className="border-b border-[#1f3d1f]/15 last:border-b-0">
                    <td className="py-2 pr-2 font-semibold">{point.week}</td>
                    <td className="py-2 pr-2">{point.weight} kg</td>
                    <td className="py-2 pr-2">{point.calories} kcal</td>
                    <td className="py-2">{point.score}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </UserPageLayout>
    </HomeLayout>
  );
}
