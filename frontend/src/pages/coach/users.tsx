import { Calendar, Loader2, Mail, Scale, Target, User, Users, UtensilsCrossed } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import CoachLayout from "@/components/coach/CoachLayout";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserRole, useCoachUserQuery, useProfileQuery } from "@/graphql/generated/schema";

export default function CoachUsers() {
  const router = useRouter();

  const { data, loading } = useProfileQuery({
    fetchPolicy: "cache-and-network",
  });

  // 🔹 récupération des utilisateurs coachés
  const { data: usersData, loading: usersLoading, error: usersError } = useCoachUserQuery();

  useEffect(() => {
    if (!loading) {
      if (!data?.me) {
        router.push("/login");
      } else if (data.me.role !== UserRole.Coach && data.me.role !== UserRole.Admin) {
        if (data.me.role === UserRole.Coachee) {
          router.push("/dashboard_user");
        } else {
          router.push("/");
        }
      }
    }
  }, [data, loading, router]);

  if (loading || usersLoading) {
    return (
      <CoachLayout pageTitle="Utilisateurs">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </CoachLayout>
    );
  }

  if (!data?.me || (data.me.role !== UserRole.Coach && data.me.role !== UserRole.Admin)) {
    return null;
  }

  if (usersError) {
    return (
      <CoachLayout pageTitle="Utilisateurs">
        <div className="p-6 text-red-500">Erreur : {usersError.message}</div>
      </CoachLayout>
    );
  }

  const users = usersData?.coachUsers ?? [];

  return (
    <CoachLayout pageTitle="Utilisateurs">
      <div className="bg-light-bg py-6 md:py-8 px-4 md:px-6 flex-1">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Gestion des utilisateurs
          </h1>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Users className="w-5 h-5" />
              <CardTitle>Utilisateurs coachés</CardTitle>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Nom
                      </div>
                    </TableHead>

                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </div>
                    </TableHead>

                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4" />
                        Poids initial
                      </div>
                    </TableHead>

                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4" />
                        Poids actuel
                      </div>
                    </TableHead>

                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Objectif
                      </div>
                    </TableHead>

                    <TableHead>
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4" />
                        Repas
                      </div>
                    </TableHead>

                    <TableHead>Score</TableHead>

                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Inscription
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {users.map((user: any) => (
                    <TableRow
                      key={user.userId}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/coach/users/${user.userId}`)}
                    >
                      <TableCell>{user.displayName}</TableCell>

                      <TableCell>{user.email}</TableCell>

                      <TableCell>{user.initialWeight ?? "-"} kg</TableCell>

                      <TableCell>{user.currentWeight ?? "-"} kg</TableCell>

                      <TableCell>{user.goalLabel ?? "-"}</TableCell>

                      <TableCell>{user.mealsCount}</TableCell>

                      <TableCell>{user.scoreRounded}%</TableCell>

                      <TableCell>{new Date(user.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {users.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  Aucun utilisateur trouvé
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </CoachLayout>
  );
}
