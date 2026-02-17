import Link from "next/link";
import type { ReactNode } from "react";

const USER_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard_user" },
  { id: "meals", label: "Mes repas", href: "/repas_utilisateur" },
  { id: "recipes", label: "Mes recettes", href: "/recettes_user" },
  { id: "evolution", label: "Mon evolution", href: "/evolution_user" },
  { id: "profile", label: "Mon Profile", href: "/user_profile" },
] as const;

type UserNavId = (typeof USER_NAV_ITEMS)[number]["id"];

interface UserPageLayoutProps {
  activeNav: UserNavId;
  children: ReactNode;
  maxWidthClassName?: string;
  contentClassName?: string;
}

export default function UserPageLayout({
  activeNav,
  children,
  maxWidthClassName = "max-w-5xl",
  contentClassName = "bg-[#f5fbf1] px-5 py-6 md:px-8",
}: UserPageLayoutProps) {
  return (
    <section className="flex-1 bg-[#f3f7ee] py-6">
      <div className={`mx-auto w-full ${maxWidthClassName} px-4`}>
        <div className="overflow-hidden rounded-md border border-[#c9c9c9] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
            <aside className="border-r border-[#c1c1c1] bg-[#d8d8d8]">
              <nav className="p-4">
                <ul className="space-y-3 text-sm text-[#3c3c3c]">
                  {USER_NAV_ITEMS.map((item) => (
                    <li key={item.id}>
                      {item.id === activeNav ? (
                        <button
                          type="button"
                          className="w-full rounded-sm bg-[#a680a8] py-2 text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                        >
                          {item.label}
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          className="block w-full rounded-sm bg-[#f1f1f1] py-2 text-center shadow-[0_2px_4px_rgba(0,0,0,0.18)]"
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <div className={contentClassName}>{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
