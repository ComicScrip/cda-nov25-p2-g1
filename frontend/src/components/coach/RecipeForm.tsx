import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateRecipeInput } from "@/graphql/generated/schema";

const STATUS_OPTIONS = [
  { value: "brouillon", label: "Brouillon" },
  { value: "publie", label: "Publié" },
  { value: "archive", label: "Archivé" },
] as const;

const MEAL_TYPE_OPTIONS = [
  { value: "petit_dejeuner", label: "Petit-déjeuner" },
  { value: "dejeuner", label: "Déjeuner" },
  { value: "collation", label: "Collation" },
  { value: "diner", label: "Dîner" },
] as const;

const DIFFICULTY_OPTIONS = [
  { value: "Facile", label: "Facile" },
  { value: "Moyen", label: "Moyen" },
  { value: "Difficile", label: "Difficile" },
] as const;

function toNum(value: string): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

type RecipeFormProps = {
  onSubmit: (input: CreateRecipeInput) => Promise<void>;
  loading?: boolean;
};

export function RecipeForm({ onSubmit, loading }: RecipeFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [instructions, setInstructions] = useState("");
  const [preparationTime, setPreparationTime] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [servings, setServings] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const [status, setStatus] = useState<string>("brouillon");
  const [mealType, setMealType] = useState("");
  const [chefTips, setChefTips] = useState("");
  const [benefitsText, setBenefitsText] = useState("");
  const [caloriesPerServing, setCaloriesPerServing] = useState("");
  const [proteinsPerServing, setProteinsPerServing] = useState("");
  const [carbohydratesPerServing, setCarbohydratesPerServing] = useState("");
  const [lipidsPerServing, setLipidsPerServing] = useState("");
  const [fiberPerServing, setFiberPerServing] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const benefits = benefitsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const input: CreateRecipeInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      photoUrl: photoUrl.trim() || undefined,
      instructions: instructions.trim() || undefined,
      preparationTime: toNum(preparationTime),
      cookingTime: toNum(cookingTime),
      servings: toNum(servings),
      difficultyLevel: difficultyLevel.trim() || undefined,
      status,
      mealType: mealType || undefined,
      chefTips: chefTips.trim() || undefined,
      benefits: benefits.length > 0 ? benefits : undefined,
      caloriesPerServing: toNum(caloriesPerServing),
      proteinsPerServing: toNum(proteinsPerServing),
      carbohydratesPerServing: toNum(carbohydratesPerServing),
      lipidsPerServing: toNum(lipidsPerServing),
      fiberPerServing: toNum(fiberPerServing),
    };

    await onSubmit(input);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Card className="border border-[#d3d8cf] bg-linear-to-br from-[#f9fbf7] to-[#f2f7ed] shadow-[0_4px_10px_rgba(15,23,42,0.12)] rounded-xl">
        <CardHeader className="pb-4 border-b border-[#dde4d7]">
          <CardTitle className="text-base font-semibold text-[#1f2933]">
            Informations générales
          </CardTitle>
          <CardDescription className="text-xs text-[#5a6758]">
            Donne un nom clair et une courte description. La photo est optionnelle mais&nbsp;recommandée.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-medium text-[#3c4a37]">
              Titre <span className="text-[#b91c1c]">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Salade de quinoa"
              required
              className="border-[#cdd6cb] bg-white text-sm placeholder:text-[#9aa69a] focus-visible:ring-2 focus-visible:ring-[#73916f] focus-visible:ring-offset-0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-medium text-[#3c4a37]">
              Description
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Courte description de la recette"
              rows={2}
              className="flex w-full rounded-md border border-[#cdd6cb] bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73916f] focus-visible:ring-offset-0 placeholder:text-[#9aa69a]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="photoUrl" className="text-xs font-medium text-[#3c4a37]">
              URL de la photo
            </Label>
            <Input
              id="photoUrl"
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className="border-[#cdd6cb] bg-white text-sm placeholder:text-[#9aa69a] focus-visible:ring-2 focus-visible:ring-[#73916f] focus-visible:ring-offset-0"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-[#d3d8cf] bg-white shadow-[0_3px_8px_rgba(15,23,42,0.15)] rounded-xl">
        <CardHeader className="pb-4 border-b border-[#e2e8dd]">
          <CardTitle className="text-base font-semibold text-[#1f2933]">Préparation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="instructions" className="text-xs font-medium text-[#3c4a37]">
              Instructions (étapes)
            </Label>
            <textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Une étape par ligne"
              rows={4}
              className="flex w-full rounded-md border border-[#cdd6cb] bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73916f] focus-visible:ring-offset-0 placeholder:text-[#9aa69a]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="prepTime" className="text-xs font-medium text-[#3c4a37]">
                Préparation (min)
              </Label>
              <Input
                id="prepTime"
                type="number"
                min={0}
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                className="border-[#cdd6cb] bg-white text-sm focus-visible:ring-2 focus-visible:ring-[#73916f] focus-visible:ring-offset-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cookingTime" className="text-xs font-medium text-[#3c4a37]">
                Cuisson (min)
              </Label>
              <Input
                id="cookingTime"
                type="number"
                min={0}
                value={cookingTime}
                onChange={(e) => setCookingTime(e.target.value)}
                className="border-[#cdd6cb] bg-white text-sm focus-visible:ring-2 focus-visible:ring-[#73916f] focus-visible:ring-offset-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servings" className="text-xs font-medium text-[#3c4a37]">
                Portions
              </Label>
              <Input
                id="servings"
                type="number"
                min={1}
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className="border-[#cdd6cb] bg-white text-sm focus-visible:ring-2 focus-visible:ring-[#73916f] focus-visible:ring-offset-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty" className="text-xs font-medium text-[#3c4a37]">
                Difficulté
              </Label>
              <select
                id="difficulty"
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
                className="flex h-9 w-full rounded-md border border-[#cdd6cb] bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73916f] focus-visible:ring-offset-0"
              >
                <option value="">—</option>
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-[#d3d8cf] bg-white shadow-[0_3px_8px_rgba(15,23,42,0.15)] rounded-xl">
        <CardHeader className="pb-4 border-b border-[#e2e8dd]">
          <CardTitle className="text-base font-semibold text-[#1f2933]">Type et statut</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mealType" className="text-xs font-medium text-[#3c4a37]">
                Type de repas
              </Label>
              <select
                id="mealType"
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-[#cdd6cb] bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73916f] focus-visible:ring-offset-0"
              >
                <option value="">—</option>
                {MEAL_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-xs font-medium text-[#3c4a37]">
                Statut
              </Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-9 w-full rounded-md border border-[#cdd6cb] bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73916f] focus-visible:ring-offset-0"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="chefTips" className="text-xs font-medium text-[#3c4a37]">
              Conseil du coach
            </Label>
            <Input
              id="chefTips"
              value={chefTips}
              onChange={(e) => setChefTips(e.target.value)}
              placeholder="Astuce ou note"
              className="border-[#cdd6cb] bg-white text-sm placeholder:text-[#9aa69a] focus-visible:ring-2 focus-visible:ring-[#73916f] focus-visible:ring-offset-0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="benefits" className="text-xs font-medium text-[#3c4a37]">
              Bénéfices (un par ligne)
            </Label>
            <textarea
              id="benefits"
              value={benefitsText}
              onChange={(e) => setBenefitsText(e.target.value)}
              placeholder="Ex: Riche en fibres"
              rows={3}
              className="flex w-full rounded-md border border-[#cdd6cb] bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73916f] focus-visible:ring-offset-0 placeholder:text-[#9aa69a]"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-[#d3d8cf] bg-white shadow-[0_3px_8px_rgba(15,23,42,0.15)] rounded-xl">
        <CardHeader className="pb-4 border-b border-[#e2e8dd]">
          <CardTitle className="text-base font-semibold text-[#1f2933]">
            Valeurs nutritionnelles (par portion)
          </CardTitle>
          <CardDescription className="text-xs text-[#5a6758]">
            Optionnel – en grammes sauf pour les kcal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="calories" className="text-xs font-medium text-[#3c4a37]">
                Calories (kcal)
              </Label>
              <Input
                id="calories"
                type="number"
                min={0}
                value={caloriesPerServing}
                onChange={(e) => setCaloriesPerServing(e.target.value)}
                className="border-[#cdd6cb] bg-white text-sm focus-visible:ring-2 focus-visible:ring-[#73916f] focus-visible:ring-offset-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proteins" className="text-xs font-medium text-[#3c4a37]">
                Protéines (g)
              </Label>
              <Input
                id="proteins"
                type="number"
                min={0}
                value={proteinsPerServing}
                onChange={(e) => setProteinsPerServing(e.target.value)}
                className="border-[#cdd6cb] bg-white text-sm focus-visible:ring-2 focus-visible:ring-[#73916f] focus-visible:ring-offset-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs" className="text-xs font-medium text-[#3c4a37]">
                Glucides (g)
              </Label>
              <Input
                id="carbs"
                type="number"
                min={0}
                value={carbohydratesPerServing}
                onChange={(e) => setCarbohydratesPerServing(e.target.value)}
                className="border-[#cdd6cb] bg-white text-sm focus-visible:ring-2 focus-visible:ring-[#73916f] focus-visible:ring-offset-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lipids" className="text-xs font-medium text-[#3c4a37]">
                Lipides (g)
              </Label>
              <Input
                id="lipids"
                type="number"
                min={0}
                value={lipidsPerServing}
                onChange={(e) => setLipidsPerServing(e.target.value)}
                className="border-[#cdd6cb] bg-white text-sm focus-visible:ring-2 focus-visible:ring-[#73916f] focus-visible:ring-offset-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiber" className="text-xs font-medium text-[#3c4a37]">
                Fibres (g)
              </Label>
              <Input
                id="fiber"
                type="number"
                min={0}
                value={fiberPerServing}
                onChange={(e) => setFiberPerServing(e.target.value)}
                className="border-[#cdd6cb] bg-white text-sm focus-visible:ring-2 focus-visible:ring-[#73916f] focus-visible:ring-offset-0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button
          type="submit"
          disabled={loading || !title.trim()}
          className="bg-[#73916f] text-white hover:bg-[#5a7356] shadow-[0_3px_8px_rgba(34,197,94,0.35)]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création…
            </>
          ) : (
            "Créer la recette"
          )}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/coach/recipes">Annuler</Link>
        </Button>
      </div>
    </form>
  );
}
