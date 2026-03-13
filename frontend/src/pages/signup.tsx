import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import HomeLayout from "@/components/HomeLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type SignupInput, useSignupMutation } from "@/graphql/generated/schema";

export default function Signup() {
  const router = useRouter();
  const [signup, { loading: isSubmitting, error }] = useSignupMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<SignupInput & { confirmPassword: string }>();

  const passwordValue = watch("password");

  const onSubmit = async (data: SignupInput & { confirmPassword: string }) => {
    try {
      const { confirmPassword, ...signupData } = data;

      await signup({ variables: { data: signupData } });

      // ✅ Notification succès
      alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");

      router.push("/login");
    } catch (err: any) {
      setError("root", {
        message:
          err?.graphQLErrors?.[0]?.message ||
          err?.message ||
          "Une erreur est survenue lors de l'inscription",
      });
    }
  };

  return (
    <HomeLayout pageTitle="Inscription">
      <div className="relative w-full min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-primary/5 px-4">
        {/* Background décoratif */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <Card className="border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader className="space-y-0.5 text-center pb-4">
              <CardTitle className="text-xl md:text-2xl font-bold">Créer un compte</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Inscrivez-vous pour accéder à votre espace MyDietChef
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-3 px-4 pb-4">
                {/* EMAIL */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    {...register("email", {
                      required: "L'email est requis",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "L'email n'est pas valide",
                      },
                    })}
                    className="h-10 text-sm border-gray-300"
                    disabled={isSubmitting}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>

                {/* PASSWORD */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm">
                    Mot de passe
                  </Label>

                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password", {
                        required: "Le mot de passe est requis",
                        minLength: {
                          value: 8,
                          message: "Le mot de passe doit contenir au moins 8 caractères",
                        },
                      })}
                      className="h-10 pr-10 text-sm border-gray-300"
                      disabled={isSubmitting}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password.message}</p>
                  )}
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm">
                    Confirmer le mot de passe
                  </Label>

                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("confirmPassword", {
                        required: "La confirmation du mot de passe est requise",
                        validate: (value) =>
                          value === passwordValue || "Les mots de passe ne correspondent pas",
                      })}
                      className="h-10 pr-10 text-sm border-gray-300"
                      disabled={isSubmitting}
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* ERREUR GLOBALE */}
                {(error || errors.root) && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-600 text-xs text-center whitespace-pre-line">
                      {errors.root?.message ||
                        error?.message ||
                        "Une erreur est survenue lors de l'inscription"}
                    </p>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-2 px-4 pb-4">
                <Button
                  type="submit"
                  className="w-full h-10 text-sm bg-dark-header text-white hover:bg-dark-footer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Inscription...
                    </>
                  ) : (
                    "S'inscrire"
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Déjà un compte ?{" "}
                  <Link
                    href="/login"
                    className="text-blue-500 font-medium hover:underline hover:text-blue-600"
                  >
                    Se connecter
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </HomeLayout>
  );
}
