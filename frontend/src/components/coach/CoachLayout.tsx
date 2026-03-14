import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import HomeLayout from "../HomeLayout";

interface CoachLayoutProps {
  children: ReactNode;
  pageTitle: string;
  footerVariant?: "default" | "userSlim";
}

export default function CoachLayout({
  children,
  pageTitle,
  footerVariant = "default",
}: CoachLayoutProps) {
  const router = useRouter();

  const menuItems = [
    { href: "/coach/dashboard", label: "Dashboard" },
    { href: "/coach/users", label: "utilisateurs" },
    { href: "/coach/recipes", label: "Recettes" },
    { href: "/coach/recipes/new", label: "Créer une recette" },
    { href: "/nutritional_analysis", label: "Analyse IA" },
  ];

  const isActive = (href: string) => {
    return router.pathname === href;
  };

  return (
    <HomeLayout pageTitle={pageTitle} footerVariant={footerVariant}>
      <div className="flex flex-1 min-h-0 bg-light-bg">
        <Card className="hidden w-52 rounded-none border-0 bg-gray-800 shadow-lg md:block md:rounded-none">
          <div className="h-full flex flex-col pt-16 md:pt-4">
            <nav className="flex-1 px-3 py-4 space-y-2.5">
              {menuItems.map((item, index) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className={`block px-4 py-4 rounded-lg transition-colors text-base font-medium ${
                      isActive(item.href)
                        ? "bg-purple-600 text-white font-semibold shadow-md"
                        : "text-gray-100 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                  {index < menuItems.length - 1 && <Separator className="my-2.5 bg-gray-600/50" />}
                </div>
              ))}
            </nav>
          </div>
        </Card>

        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">{children}</main>
      </div>
    </HomeLayout>
  );
}
