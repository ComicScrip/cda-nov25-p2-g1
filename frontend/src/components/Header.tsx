import Link from "next/link";
import { useRouter } from "next/router";
import { useLogoutMutation, useProfileQuery } from "@/graphql/generated/schema";

export default function Header() {
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
    <header>
      <nav className="flex p-4 border-b border-gray-400 w-full flex-row justify-between items-center">
        <Link href="/" className="w-max">
          <h1 className="text-orange-600 text-2xl font-bold">P2 template</h1>
        </Link>

        <div className="flex gap-2 items-center">
          {!loading &&
            (user ? (
              <>
                <div className="flex items-center gap-2 mr-2">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {getUserInitial(user.email)}
                  </div>
                </div>
                <button type="button" onClick={handleLogout} className="btn btn-outline btn-sm">
                  Déconnexion
                </button>

                {user.role === "admin" && (
                  <Link href="/admin" className="btn btn-outline btn-sm">
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/signup" className="btn btn-outline btn-sm">
                  S'inscrire
                </Link>
                <Link href="/login" className="btn btn-outline btn-sm">
                  Se connecter
                </Link>
              </>
            ))}
        </div>
      </nav>
    </header>
  );
}
