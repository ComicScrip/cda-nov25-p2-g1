import { Menu, X } from "lucide-react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLogoutMutation, useProfileQuery } from "@/graphql/generated/schema";
import Footer from "../Footer";

interface CoachLayoutProps {
  children: ReactNode;
  pageTitle: string;
}

export default function CoachLayout({ children, pageTitle }: CoachLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { data } = useProfileQuery({
    fetchPolicy: "cache-and-network",
  });
  const user = data?.me;
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const getUserName = (email: string) => {
    const name = email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const menuItems = [
    { href: "/coach/dashboard", label: "Dashboard" },
    { href: "/coach/users", label: "utilisateurs" },
    { href: "/coach/recipes", label: "Recettes" },
    { href: "/nutritional_analysis", label: "Analyse IA" },
  ];

  const isActive = (href: string) => {
    return router.pathname === href;
  };

  return (
    <div className="min-h-screen flex flex-col bg-light-bg">
      <Head>
        <title>{`MyDietChef - ${pageTitle}`}</title>
        <meta name="description" content="Espace coach MyDietChef" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-dark-header w-full z-10">
        <nav className="flex items-center justify-between px-4 py-3 md:px-8 md:py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="logo-circle logo-circle-hover w-12 h-12 overflow-hidden rounded-full bg-white shadow-sm">
              <Image
                src="/Logo_MDC.png"
                alt="MyDietChef"
                width={48}
                height={48}
                className="h-12 w-12 object-cover"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {user && (
              <>
                <span className="text-white text-sm md:text-base">
                  Bonjour {getUserName(user.email)}
                </span>
                <Separator orientation="vertical" className="h-6 bg-gray-600" />
                <Button
                  type="button"
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-gray-300 hover:bg-gray-700"
                >
                  Déconnexion
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-gray-700"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </nav>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <Card
          className={`${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 fixed md:static inset-y-0 left-0 z-20 w-52 bg-gray-800 border-0 rounded-none md:rounded-none transition-transform duration-300 ease-in-out md:transition-none shadow-lg`}
        >
          <div className="h-full flex flex-col pt-16 md:pt-4">
            <nav className="flex-1 px-3 py-4 space-y-2.5">
              {menuItems.map((item, index) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
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

        {/* Overlay for mobile */}
        {isMenuOpen && (
          <button
            type="button"
            className="fixed inset-0 bg-black/50 z-10 md:hidden"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          />
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">{children}</main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
