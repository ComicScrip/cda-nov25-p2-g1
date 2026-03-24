import Link from "next/link";
import type { ReactNode } from "react";

const USER_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard_user" },
  { id: "meals", label: "Mes Repas", href: "/user_meals" },
  { id: "recipes", label: "Mes Recettes", href: "/user_recipe" },
  { id: "evolution", label: "Mon Evolution", href: "/evolution_user" },
  { id: "profile", label: "Mon Profil", href: "/user_profile" },
  { id: "aiAssist", label: "IA Assiste", href: "/meals_scanning" },
  { id: "analyseIa", label: "Analyse IA", href: "/nutritional_analysis" },
] as const;

type UserNavId = (typeof USER_NAV_ITEMS)[number]["id"];

interface UserPageLayoutProps {
  activeNav: UserNavId;
  children: ReactNode;
  maxWidthClassName?: string;
  contentClassName?: string;
  frameClassName?: string;
  hideSidebarOnMobile?: boolean;
}

export default function UserPageLayout({
  activeNav,
  children,
  maxWidthClassName = "max-w-5xl xl:max-w-none",
  contentClassName = "bg-[#f5fbf1] px-5 py-6 md:px-8",
  frameClassName = "overflow-hidden rounded-md border border-[#c9c9c9] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.12)]",
  hideSidebarOnMobile = true,
}: UserPageLayoutProps) {
  return (
    <section className="flex flex-1 bg-[#f3f7ee]">
      <div className={`mx-auto flex w-full flex-1 xl:mx-0 ${maxWidthClassName}`}>
        <div className={`flex flex-1 ${frameClassName}`}>
          <div className="grid h-full w-full grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)]">
            <aside
              className={`relative z-10 border-r border-[#c1c1c1] bg-[#d8d8d8] md:h-full ${
                hideSidebarOnMobile ? "hidden md:block" : ""
              }`}
            >
              <nav className="p-4 md:sticky md:top-4">
                <ul className="space-y-3 text-sm text-[#3c3c3c]">
                  {USER_NAV_ITEMS.map((item) => (
                    <li key={item.id}>
                      {item.id === activeNav ? (
                        <button
                          type="button"
                          className="block w-full rounded-sm bg-[#a680a8] py-2 text-center text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                        >
                          {item.label}
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          className="relative z-10 block w-full rounded-sm bg-[#f1f1f1] py-2 text-center shadow-[0_2px_4px_rgba(0,0,0,0.18)] transition-all duration-200 hover:scale-[1.02] hover:bg-[#a680a8] hover:text-white hover:shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <div className={`relative z-0 min-w-0 ${contentClassName}`}>{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
