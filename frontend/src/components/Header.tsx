import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLogoutMutation, useProfileQuery } from "@/graphql/generated/schema";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data, loading, refetch } = useProfileQuery({
    fetchPolicy: "cache-and-network",
  });
  const user = data?.me || null;

  const [logout] = useLogoutMutation();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      await refetch();
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const getUserInitial = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-dark-header w-full">
      <nav className="flex items-center justify-between px-4 py-3 md:px-8 md:py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-gray-800 text-2xl font-bold">M</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {!loading &&
            (user ? (
              <>
                <div className="flex items-center gap-2 mr-2">
                  <div className="w-8 h-8 bg-gray-300 text-gray-800 rounded-full flex items-center justify-center text-sm font-bold">
                    {getUserInitial(user.email)}
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-gray-300 hover:bg-gray-700"
                >
                  Déconnexion
                </Button>
                {user.role === "admin" && (
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-gray-300 hover:bg-gray-700"
                  >
                    <Link href="/admin">Admin</Link>
                  </Button>
                )}
              </>
            ) : (
              <>
                <Link href="/login" className="text-white hover:text-gray-300 transition-colors">
                  Connexion
                </Link>
                <Link href="/#about" className="text-white hover:text-gray-300 transition-colors">
                  A propos
                </Link>
                <Link href="/signup" className="text-white hover:text-gray-300 transition-colors">
                  Essayer gratuitement
                </Link>
                <Link href="/#coach" className="text-white hover:text-gray-300 transition-colors">
                  Espace coach
                </Link>
              </>
            ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <title>Toggle menu</title>
            {isMenuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-header border-t border-gray-700">
          <div className="flex flex-col px-4 py-4 gap-4">
            {!loading &&
              (user ? (
                <>
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-700">
                    <div className="w-8 h-8 bg-gray-300 text-gray-800 rounded-full flex items-center justify-center text-sm font-bold">
                      {getUserInitial(user.email)}
                    </div>
                    <span className="text-white text-sm">{user.email}</span>
                  </div>
                  <Button
                    type="button"
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-gray-300 hover:bg-gray-700 justify-start"
                  >
                    Déconnexion
                  </Button>
                  {user.role === "admin" && (
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-gray-300 hover:bg-gray-700 justify-start"
                    >
                      <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                        Admin
                      </Link>
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-white hover:text-gray-300 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/#about"
                    className="text-white hover:text-gray-300 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    A propos
                  </Link>
                  <Link
                    href="/signup"
                    className="text-white hover:text-gray-300 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Essayer gratuitement
                  </Link>
                  <Link
                    href="/#coach"
                    className="text-white hover:text-gray-300 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Espace coach
                  </Link>
                </>
              ))}
          </div>
        </div>
      )}
    </header>
  );
}
