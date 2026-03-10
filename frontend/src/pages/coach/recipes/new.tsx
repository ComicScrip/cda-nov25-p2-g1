import { useMutation } from "@apollo/client/react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import CoachLayout from "@/components/coach/CoachLayout";
import { RecipeForm } from "@/components/coach/RecipeForm";
import { Button } from "@/components/ui/button";
import {
  CreateRecipeDocument,
  type CreateRecipeInput,
  type CreateRecipeMutation,
  type CreateRecipeMutationVariables,
  UserRole,
  useProfileQuery,
} from "@/graphql/generated/schema";

export default function CoachRecipeNew() {
  const router = useRouter();
  const { data: profileData, loading: profileLoading } = useProfileQuery({
    fetchPolicy: "cache-and-network",
  });
  const [createRecipe, { loading: creating }] = useMutation<
    CreateRecipeMutation,
    CreateRecipeMutationVariables
  >(CreateRecipeDocument);

  useEffect(() => {
    if (profileLoading) return;
    if (!profileData?.me) {
      router.push("/login");
    } else if (profileData.me.role !== UserRole.Coach && profileData.me.role !== UserRole.Admin) {
      router.push("/");
    }
  }, [profileData, profileLoading, router]);

  const handleSubmit = async (input: CreateRecipeInput) => {
    try {
      const result = await createRecipe({
        variables: { input },
      });

      if (result.data?.createRecipe?.id) {
        router.push("/coach/recipes");
      }
    } catch (err) {
      console.error("Create recipe error:", err);
    }
  };

  if (profileLoading) {
    return (
      <CoachLayout pageTitle="Nouvelle recette">
        <section className="flex flex-1 items-center justify-center bg-[#f3f7ee] py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#73916f]" />
        </section>
      </CoachLayout>
    );
  }

  return (
    <CoachLayout pageTitle="Nouvelle recette">
      <section className="flex-1 bg-[#f3f7ee] py-6">
        <div className="mx-auto max-w-2xl px-4">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h1 className="text-xl font-semibold text-[#2e3a2d]">Créer une recette</h1>
            <Button variant="outline" asChild>
              <Link href="/coach/recipes">Retour aux recettes</Link>
            </Button>
          </div>

          <RecipeForm onSubmit={handleSubmit} loading={creating} />
        </div>
      </section>
    </CoachLayout>
  );
}
