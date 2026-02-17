import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input"; //shadcn npx shadcn@latest add input
import { Label } from "@/components/ui/label"; //shadcn npx shadcn@latest add label
import { type LoginInput, useLoginMutation, useProfileQuery } from "@/graphql/generated/schema";

export default function Login() {
  const router = useRouter();

  const {
    data: profileData,
    loading: profileLoading,
    refetch: refetchProfile,
  } = useProfileQuery({
    errorPolicy: "all",
    fetchPolicy: "network-only",
  });

  const [login, { loading: isSubmitting, error }] = useLoginMutation({
    refetchQueries: ["profile"],
  });

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginInput>();

  useEffect(() => {
    if (!profileLoading && profileData?.me) {
      if (profileData.me.role === "Coach") {
        router.push("/coach/dashboard");
      } else {
        router.push("/dashboard_user");
      }
    }
  }, [profileData, profileLoading, router]);

  const onSubmit = async (formData: LoginInput) => {
    try {
      const result = await login({
        variables: {
          data: {
            email: formData.email,
            password: formData.password,
          },
        },
      });

      if (result.data?.login) {
        const returnUrl = router.query.returnUrl as string | undefined;

        if (returnUrl) {
          router.push(returnUrl);
        } else {
          const { data: updatedProfile } = await refetchProfile();

          if (updatedProfile?.me?.role === "Coach") {
            router.push("/coach/dashboard");
          } else {
            router.push("/dashboard_user");
          }
        }
      } else {
        setError("root", {
          message: "Erreur lors de la connexion. Veuillez réessayer.",
        });
      }
    } catch (err: any) {
      const errorMessage =
        err?.graphQLErrors?.[0]?.message ||
        err?.message ||
        "Une erreur est survenue lors de la connexion";

      setError("root", { message: errorMessage });
    }
  };

  if (profileLoading) {
    return (
      <HomeLayout pageTitle="Connexion">
        <div className="min-h-[calc(100vh-64px-100px)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </HomeLayout>
    );
  }

  if (profileData?.me) {
    return null;
  }

  return (
    <HomeLayout pageTitle="Connexion">
      <div className="w-full flex items-center justify-center bg-linear-to-br from-background via-background to-primary/5 px-4 py-4 md:py-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <Card className="border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader className="space-y-0.5 text-center pb-4">
              <CardTitle className="text-xl md:text-2xl font-bold">Se connecter</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Connectez-vous à votre compte MyDietChef
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-3 px-4 pb-4">
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
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>

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
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                </div>

                {(error || errors.root) && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-600 text-xs text-center whitespace-pre-line">
                      {(error as any)?.graphQLErrors?.[0]?.message ||
                        error?.message ||
                        errors.root?.message ||
                        "Une erreur est survenue lors de la connexion"}
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
                      Connexion...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Pas encore de compte ?{" "}
                  <Link
                    href="/signup"
                    className="text-blue-500 font-medium hover:underline hover:text-blue-600"
                  >
                    S'inscrire
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
