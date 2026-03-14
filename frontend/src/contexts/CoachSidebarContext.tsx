import Link from "next/link";
import { useRouter } from "next/router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
  useState,
} from "react";
import { X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useLogoutMutation, useProfileQuery } from "@/graphql/generated/schema";

type CoachSidebarContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const CoachSidebarContext = createContext<CoachSidebarContextValue | null>(null);

export function useCoachSidebar() {
  const ctx = useContext(CoachSidebarContext);
  return ctx;
}

const COACH_MENU_ITEMS = [
  { href: "/coach/dashboard", label: "Dashboard" },
  { href: "/coach/users", label: "utilisateurs" },
  { href: "/coach/recipes", label: "Recettes" },
  { href: "/coach/recipes/new", label: "Créer une recette" },
  { href: "/nutritional_analysis", label: "Analyse IA" },
] as const;

export function CoachSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  return (
    <CoachSidebarContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </CoachSidebarContext.Provider>
  );
}

export function CoachSidebarPanel() {
  const router = useRouter();
  const ctx = useCoachSidebar();
  const [isDesktop, setIsDesktop] = useState(false);
  const { refetch } = useProfileQuery({ fetchPolicy: "cache-and-network" });
  const [logout] = useLogoutMutation();

  useEffect(() => {
    const m = window.matchMedia("(min-width: 768px)");
    setIsDesktop(m.matches);
    const f = () => setIsDesktop(m.matches);
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);

  if (!ctx) return null;

  const { isOpen, close } = ctx;
  const sidebarVisible = isDesktop || isOpen;

  const handleLogout = useCallback(async () => {
    try {
      close();
      await logout();
      await refetch();
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }, [close, logout, refetch, router]);
  const isActive = (href: string) => router.pathname === href;

  return (
    <>
      {/* Fond sombre : uniquement sur mobile quand le menu est ouvert */}
      {isOpen && (
        <button
          type="button"
          onClick={close}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-label="Fermer le menu"
        />
      )}
      {/* Sidebar : fixe à gauche sur desktop, overlay sur mobile */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 transform bg-gray-800 shadow-xl transition-transform duration-200 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        aria-hidden={!sidebarVisible}
      >
        <div className="flex h-full flex-col pt-14 md:pt-16">
          <div className="flex items-center justify-between border-b border-gray-600 px-4 py-3">
            <span className="text-sm font-semibold text-white">Menu coach</span>
            <button
              type="button"
              onClick={close}
              className="rounded p-1 text-gray-300 hover:bg-gray-700 hover:text-white md:hidden"
              aria-label="Fermer le menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2.5">
            {COACH_MENU_ITEMS.map((item, index) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className={`block px-4 py-4 rounded-lg transition-colors text-base font-medium ${
                    isActive(item.href)
                      ? "bg-purple-600 text-white font-semibold shadow-md"
                      : "text-gray-100 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
                {index < COACH_MENU_ITEMS.length - 1 && (
                  <Separator className="my-2.5 bg-gray-600/50" />
                )}
              </div>
            ))}
          </nav>
          <Separator className="my-2.5 bg-gray-600/50" />
          <div className="px-3 py-4">
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full rounded-lg px-4 py-4 text-left text-base font-medium text-gray-100 hover:bg-gray-700 hover:text-white"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
