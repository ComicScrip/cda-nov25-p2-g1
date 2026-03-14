import { Calendar, Loader2, Mail, Scale, Target, User, Users, UtensilsCrossed } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
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
import type { CoachUsersPageQuery } from "@/graphql/generated/schema";
import {
  UserRole,
  useCoachUsersPageLazyQuery,
  useCoachUsersPageQuery,
  useProfileQuery,
} from "@/graphql/generated/schema";

const USERS_PER_PAGE = 15;

type CoachUserRow = NonNullable<
  NonNullable<CoachUsersPageQuery["coachUsersPage"]>["users"]
>[number];

export default function CoachUsers() {
  const router = useRouter();
  const [allUsers, setAllUsers] = useState<CoachUserRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const listScrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);

  const { data, loading } = useProfileQuery({
    fetchPolicy: "cache-and-network",
  });

  const {
    data: pageData,
    loading: usersLoading,
    error: usersError,
  } = useCoachUsersPageQuery({
    fetchPolicy: "network-only",
    variables: { limit: USERS_PER_PAGE, offset: 0 },
  });

  const [loadMore, { loading: loadMoreLoading }] = useCoachUsersPageLazyQuery();

  useEffect(() => {
    const page = pageData?.coachUsersPage;
    if (page) {
      setAllUsers(page.users);
      setTotalCount(page.totalCount);
    }
  }, [pageData]);

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

  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;
    const scrollRoot = listScrollContainerRef.current ?? null;
    if (!sentinel || totalCount === 0 || allUsers.length >= totalCount) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          !entry?.isIntersecting ||
          loadMoreLoading ||
          isLoadingMoreRef.current ||
          allUsers.length >= totalCount
        )
          return;
        isLoadingMoreRef.current = true;
        const currentLength = allUsers.length;
        loadMore({
          variables: {
            limit: USERS_PER_PAGE,
            offset: currentLength,
          },
        })
          .then((result) => {
            const nextUsers = result.data?.coachUsersPage?.users ?? [];
            if (nextUsers.length === 0) return;
            setAllUsers((prev) => {
              const existingIds = new Set(prev.map((u) => u.userId));
              const newOnes = nextUsers.filter((u) => !existingIds.has(u.userId));
              if (newOnes.length === 0) return prev;
              return [...prev, ...newOnes].slice(0, totalCount);
            });
          })
          .finally(() => {
            isLoadingMoreRef.current = false;
          });
      },
      { root: scrollRoot, rootMargin: "200px", threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [allUsers.length, totalCount, loadMoreLoading, loadMore]);

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
              <div ref={listScrollContainerRef} className="overflow-auto max-h-[70vh]">
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
                    {allUsers.map((user) => (
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
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div
                  ref={loadMoreSentinelRef}
                  className="h-4 flex items-center justify-center py-4"
                >
                  {loadMoreLoading && (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>

              {allUsers.length === 0 && !usersLoading && (
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
