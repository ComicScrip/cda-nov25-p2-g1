import HomeLayout from "@/components/HomeLayout";

const stats = [
  { value: "7", label: "jours d'utilisation", bg: "bg-[#bfe8ea]" },
  { value: "85%", label: "Score santé", bg: "bg-[#cfa0c8]" },
  { value: "10", label: "repas scannés", bg: "bg-[#a7d9a1]" },
  { value: "1780", label: "Calories moyennes", bg: "bg-[#e9b26b]" },
];

const meals = [
  { name: "Salade méditerranéenne", kcal: "320 kcal", protein: "25g", carbs: "42g", fat: "18g" },
  { name: "Hachis parmentier allégé", kcal: "420 kcal", protein: "25g", carbs: "42g", fat: "18g" },
  { name: "Salade césar", kcal: "380 kcal", protein: "25g", carbs: "42g", fat: "18g" },
  { name: "Bowl quinoa & poulet", kcal: "410 kcal", protein: "30g", carbs: "36g", fat: "14g" },
];

export default function DashboardPage() {
  return (
    <HomeLayout pageTitle="Dashboard">
      <section className="flex-1 bg-[#f3f7ee] py-6">
        <div className="mx-auto w-full max-w-5xl px-4">
          <div className="overflow-hidden rounded-md border border-[#c9c9c9] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
              <aside className="bg-[#d8d8d8] border-r border-[#c1c1c1]">
                <nav className="p-4">
                  <ul className="space-y-3 text-sm text-[#3c3c3c]">
                    <li>
                      <button
                        type="button"
                        className="w-full rounded-sm bg-[#a680a8] py-2 text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                      >
                        Dashboard
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="w-full rounded-sm bg-[#f1f1f1] py-2 shadow-[0_2px_4px_rgba(0,0,0,0.18)]"
                      >
                        Mes repas
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="w-full rounded-sm bg-[#f1f1f1] py-2 shadow-[0_2px_4px_rgba(0,0,0,0.18)]"
                      >
                        Mes recettes
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="w-full rounded-sm bg-[#f1f1f1] py-2 shadow-[0_2px_4px_rgba(0,0,0,0.18)]"
                      >
                        Mon évolution
                      </button>
                    </li>
                  </ul>
                </nav>
              </aside>

              <div className="bg-[#f5fbf1] px-5 py-6 md:px-8">
                <div className="grid w-full max-w-md grid-cols-2 gap-3">
                  {stats.map((stat) => (
                    <div
                      key={`${stat.value}-${stat.label}`}
                      className={`${stat.bg} rounded-md px-3 py-2 text-xs text-[#2c2c2c] shadow-[0_2px_4px_rgba(0,0,0,0.2)]`}
                    >
                      <div className="text-sm font-semibold">{stat.value}</div>
                      <div className="text-[11px]">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 max-w-2xl text-[#2c2c2c]">
                  <h1 className="text-lg font-semibold">
                    Bienvenue dans ta tour de contrôle Anthony
                  </h1>
                  <p className="mt-1 text-xs text-[#555]">
                    Ici, vous avez un résumé en chiffres de votre activité nutritionnelle
                  </p>
                </div>

                <div className="mt-6 rounded-md border border-[#d5a76a] bg-linear-to-r from-[#f4d49a] to-[#eaa552] p-4 shadow-[0_3px_6px_rgba(0,0,0,0.2)]">
                  <div className="flex items-start justify-between">
                    <div className="text-sm font-semibold text-[#3a2a12]">
                      Objectif calorique <span className="ml-2 font-normal">2000 cal / j</span>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2bbf5c] text-xs font-bold text-white">
                      97%
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-4 text-xs text-[#3a2a12]">
                    <div>
                      <div>Protéines</div>
                      <div className="font-semibold">150 g</div>
                    </div>
                    <div className="border-x border-[#c9935d] px-3">
                      <div>Glucides</div>
                      <div className="font-semibold">120 g</div>
                    </div>
                    <div>
                      <div>Lipides</div>
                      <div className="font-semibold">40 g</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-md bg-[#89c689] p-4 text-[#1f3d1f] shadow-[0_3px_6px_rgba(0,0,0,0.2)]">
                  <h2 className="text-sm font-semibold">Derniers repas de la journée</h2>
                  <div className="mt-3 grid gap-3 text-[11px] sm:grid-cols-2">
                    {meals.map((meal, index) => {
                      const isSecondRow = index >= 2;
                      const isRightColumn = index % 2 === 1;
                      const dividerClasses = [
                        "space-y-1",
                        index > 0 ? "border-t border-[#1f3d1f]/25 pt-2" : "",
                        isSecondRow ? "sm:border-t sm:border-[#1f3d1f]/25 sm:pt-3" : "sm:border-t-0 sm:pt-0",
                        isRightColumn ? "sm:border-l sm:border-[#1f3d1f]/25 sm:pl-3" : "sm:border-l-0 sm:pl-0",
                      ]
                        .filter(Boolean)
                        .join(" ");

                      return (
                        <div key={meal.name} className={dividerClasses}>
                        <div className="font-semibold">{meal.name}</div>
                        <div>{meal.kcal}</div>
                        <div>
                          P: {meal.protein} | G: {meal.carbs} | L: {meal.fat}
                        </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    className="rounded-md bg-black px-6 py-2 text-xs font-semibold text-white shadow-[0_3px_6px_rgba(0,0,0,0.3)]"
                  >
                    Scanner un repas
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </HomeLayout>
  );
}
