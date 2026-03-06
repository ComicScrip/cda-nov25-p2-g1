import { Clock3, Loader2, Search, TrendingUp, Users, UtensilsCrossed } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import CoachLayout from "@/components/coach/CoachLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserRole, useCoachDashboardDataQuery, useProfileQuery } from "@/graphql/generated/schema";
import { getDefaultDashboardHref } from "@/lib/auth";

export default function CoachUsers() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { data, loading } = useProfileQuery({
    fetchPolicy: "cache-and-network",
  });
  const {
    data: coachDashboardData,
    loading: coachUsersLoading,
    error: coachUsersError,
  } = useCoachDashboardDataQuery({
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (!loading) {
      if (!data?.me) {
        void router.replace({
          pathname: "/coach/login",
          query: { returnUrl: router.asPath },
        });
      } else if (data.me.role !== UserRole.Coach) {
        void router.replace(getDefaultDashboardHref(data.me.role));
      }
    }
  }, [data, loading, router]);

  const coachedUsers = coachDashboardData?.coachDashboardData?.coachedUsers ?? [];
  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return coachedUsers;
    }

    return coachedUsers.filter((user) => {
      const haystack = `${user.name} ${user.email}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [coachedUsers, searchTerm]);

  useEffect(() => {
    if (filteredUsers.length === 0) {
      setSelectedUserId(null);
      return;
    }

    if (!selectedUserId || !filteredUsers.some((user) => user.id === selectedUserId)) {
      setSelectedUserId(filteredUsers[0].id);
    }
  }, [filteredUsers, selectedUserId]);

  const selectedUser =
    filteredUsers.find((user) => user.id === selectedUserId) ?? filteredUsers[0] ?? null;

  const formatLastMealAt = (value?: string | null) => {
    if (!value) return "Aucune activité enregistrée";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("fr-FR");
  };

  if (loading) {
    return (
      <CoachLayout pageTitle="Utilisateurs">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </CoachLayout>
    );
  }

  if (!data?.me || data.me.role !== UserRole.Coach) {
    return null;
  }

  return (
    <CoachLayout pageTitle="Utilisateurs">
      <div className="flex-1 bg-[#f3f7ee] py-6">
        <div className="mx-auto w-full max-w-[95%] px-4">
          <div className="mb-5 max-w-3xl text-[#2c2c2c]">
            <h1 className="text-xl font-semibold md:text-2xl">Mes coachés</h1>
            <p className="mt-1 text-sm text-[#555]">
              Consultez tous les utilisateurs rattachés à votre compte, puis sélectionnez celui à
              suivre plus en détail.
            </p>
          </div>

          {coachUsersLoading ? (
            <Card className="border-[#d8e3d3] shadow-sm">
              <CardContent className="flex items-center gap-2 px-4 py-5 text-sm text-[#4a4a4a]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement des coachés...
              </CardContent>
            </Card>
          ) : coachUsersError ? (
            <Card className="border-red-200 bg-red-50 shadow-sm">
              <CardContent className="px-4 py-5 text-sm text-red-700">
                Impossible de charger vos coachés pour le moment.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
              <Card className="border-[#d8e3d3] shadow-sm">
                <CardHeader className="space-y-3 border-b border-[#e6efe1] bg-[#f8fbf5]">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base text-[#243124]">
                      <Users className="h-5 w-5" />
                      Liste sélective
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs text-[#5b6957]">
                      {filteredUsers.length} coaché{filteredUsers.length > 1 ? "s" : ""} affiché
                      {filteredUsers.length > 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6c7a67]" />
                    <Input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Rechercher par nom ou email"
                      className="pl-9"
                    />
                  </div>
                </CardHeader>
                <CardContent className="max-h-[560px] space-y-2 overflow-y-auto p-3">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => {
                      const isSelected = user.id === selectedUser?.id;

                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => setSelectedUserId(user.id)}
                          className={`w-full rounded-xl border p-3 text-left transition ${
                            isSelected
                              ? "border-[#5f9361] bg-[#edf7ea] shadow-sm"
                              : "border-[#d8e3d3] bg-white hover:border-[#9fc09d] hover:bg-[#f8fbf5]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-[#243124]">{user.name}</p>
                              <p className="mt-1 text-xs text-[#5b6957]">{user.email}</p>
                            </div>
                            <div className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-xs font-medium text-[#345035]">
                              <TrendingUp className="h-3.5 w-3.5" />
                              {Math.round(user.score)}
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-4 text-xs text-[#5b6957]">
                            <span className="inline-flex items-center gap-1">
                              <UtensilsCrossed className="h-3.5 w-3.5" />
                              {user.scannedMeals} repas
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock3 className="h-3.5 w-3.5" />
                              {user.lastMealAt ? "Actif récemment" : "Sans activité"}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#c8d6c2] bg-white px-4 py-6 text-sm text-[#5b6957]">
                      Aucun coaché ne correspond à votre recherche.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-[#d8e3d3] shadow-sm">
                <CardHeader className="border-b border-[#e6efe1] bg-[#f8fbf5]">
                  <CardTitle className="text-base text-[#243124]">
                    {selectedUser ? selectedUser.name : "Aucun coaché sélectionné"}
                  </CardTitle>
                  <CardDescription className="text-sm text-[#5b6957]">
                    {selectedUser
                      ? "Résumé du coaché sélectionné"
                      : "Sélectionnez un coaché dans la liste pour voir son résumé"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  {selectedUser ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card className="border-[#e0eadb] bg-[#fcfef9] shadow-none">
                        <CardContent className="space-y-2 p-4">
                          <p className="text-xs uppercase tracking-[0.12em] text-[#6c7a67]">
                            Email
                          </p>
                          <p className="text-sm font-medium text-[#243124]">{selectedUser.email}</p>
                        </CardContent>
                      </Card>

                      <Card className="border-[#e0eadb] bg-[#fcfef9] shadow-none">
                        <CardContent className="space-y-2 p-4">
                          <p className="text-xs uppercase tracking-[0.12em] text-[#6c7a67]">
                            Score moyen
                          </p>
                          <p className="text-sm font-medium text-[#243124]">
                            {Math.round(selectedUser.score)} / 100
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-[#e0eadb] bg-[#fcfef9] shadow-none">
                        <CardContent className="space-y-2 p-4">
                          <p className="text-xs uppercase tracking-[0.12em] text-[#6c7a67]">
                            Repas scannés
                          </p>
                          <p className="text-sm font-medium text-[#243124]">
                            {selectedUser.scannedMeals}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-[#e0eadb] bg-[#fcfef9] shadow-none">
                        <CardContent className="space-y-2 p-4">
                          <p className="text-xs uppercase tracking-[0.12em] text-[#6c7a67]">
                            Dernière activité
                          </p>
                          <p className="text-sm font-medium text-[#243124]">
                            {formatLastMealAt(selectedUser.lastMealAt)}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#c8d6c2] bg-white px-4 py-6 text-sm text-[#5b6957]">
                      Aucun coaché disponible pour ce compte.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </CoachLayout>
  );
}
