import { gql } from "@apollo/client";
import { useApolloClient, useMutation } from "@apollo/client/react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type LoginInput,
  UserRole,
  useLogoutMutation,
  useProfileQuery,
} from "@/graphql/generated/schema";
import { getDefaultDashboardHref, getSafeReturnUrl } from "@/lib/auth";

type LoginAudience = "coach" | "user";

interface AuthLoginPageProps {
  audience: LoginAudience;
}

type AuthMutationResponse = {
  login?: string;
  loginCoach?: string;
};

type AuthMutationVariables = {
  data: LoginInput;
};

const LOGIN_MUTATION = gql`
  mutation Login($data: LoginInput!) {
    login(data: $data)
  }
`;

const LOGIN_COACH_MUTATION = gql`
  mutation LoginCoach($data: LoginInput!) {
    loginCoach(data: $data)
  }
`;

const LOGIN_COPY: Record<
  LoginAudience,
  {
    pageTitle: string;
    title: string;
    description: string;
    submitLabel: string;
    footerLinks: Array<{
      href: string;
      label: string;
      text: string;
    }>;
    forbiddenMessage: string;
  }
> = {
  user: {
    pageTitle: "Connexion",
    title: "Se connecter",
    description: "Connectez-vous à votre compte MyDietChef",
    submitLabel: "Se connecter",
    footerLinks: [
      {
        href: "/signup",
        label: "S'inscrire",
        text: "Pas encore de compte ?",
      },
      {
        href: "/coach/login",
        label: "Accéder à l'espace coach",
        text: "Vous êtes coach ?",
      },
    ],
    forbiddenMessage: "Les comptes coach doivent utiliser l'espace coach.",
  },
  coach: {
    pageTitle: "Connexion coach",
    title: "Connexion coach",
    description: "Accédez à votre espace coach MyDietChef",
    submitLabel: "Entrer dans l'espace coach",
    footerLinks: [
      {
        href: "/login",
        label: "Connexion utilisateur",
        text: "Vous êtes utilisateur ?",
      },
    ],
    forbiddenMessage: "Seuls les coachs peuvent se connecter ici.",
  },
};

const isRoleAllowed = (audience: LoginAudience, role: UserRole) => {
  if (audience === "coach") {
    return role === UserRole.Coach;
  }

  return role !== UserRole.Coach;
};

export default function AuthLoginPage({ audience }: AuthLoginPageProps) {
  const client = useApolloClient();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isHandlingLogin, setIsHandlingLogin] = useState(false);
  const copy = LOGIN_COPY[audience];
  const loginMutation = audience === "coach" ? LOGIN_COACH_MUTATION : LOGIN_MUTATION;

  const {
    data: profileData,
    loading: profileLoading,
    refetch: refetchProfile,
  } = useProfileQuery({
    errorPolicy: "all",
    fetchPolicy: "network-only",
  });

  const [login, { loading: isSubmitting, error }] = useMutation<
    AuthMutationResponse,
    AuthMutationVariables
  >(loginMutation);
  const [logout] = useLogoutMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginInput>();

  useEffect(() => {
    if (!isHandlingLogin && !profileLoading && profileData?.me) {
      void router.replace(getDefaultDashboardHref(profileData.me.role));
    }
  }, [isHandlingLogin, profileData, profileLoading, router]);

  const onSubmit = async (formData: LoginInput) => {
    setIsHandlingLogin(true);

    try {
      const result = await login({
        variables: {
          data: {
            email: formData.email,
            password: formData.password,
          },
        },
      });

      const loginResult = audience === "coach" ? result.data?.loginCoach : result.data?.login;

      if (!loginResult) {
        setError("root", {
          message: "Erreur lors de la connexion. Veuillez réessayer.",
        });
        return;
      }

      const { data: updatedProfile } = await refetchProfile();
      const role = updatedProfile?.me?.role;

      if (!role) {
        setError("root", {
          message: "Impossible de récupérer votre profil après connexion.",
        });
        return;
      }

      if (!isRoleAllowed(audience, role)) {
        await logout();
        await client.clearStore();
        await refetchProfile();
        setError("root", {
          message: copy.forbiddenMessage,
        });
        return;
      }

      const returnUrl = getSafeReturnUrl(router.query.returnUrl);
      const normalizedReturnUrl =
        role === UserRole.Coach && returnUrl === "/coach/dashboard_coach_test"
          ? "/coach/dashboard"
          : returnUrl;
      const targetUrl = normalizedReturnUrl ?? getDefaultDashboardHref(role);

      void router.replace(targetUrl);
    } catch (err: any) {
      const errorMessage =
        err?.graphQLErrors?.[0]?.message ||
        err?.message ||
        "Une erreur est survenue lors de la connexion";

      setError("root", { message: errorMessage });
    } finally {
      setIsHandlingLogin(false);
    }
  };

  if (profileLoading) {
    return (
      <HomeLayout pageTitle={copy.pageTitle} footerVariant="userSlim">
        <div className="min-h-[calc(100vh-64px-100px)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </HomeLayout>
    );
  }

  if (!isHandlingLogin && profileData?.me) {
    return null;
  }

  return (
    <HomeLayout pageTitle={copy.pageTitle} footerVariant="userSlim">
      <div className="relative flex w-full items-center justify-center bg-linear-to-br from-background via-background to-primary/5 px-4 py-4 md:py-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-0 bottom-1/4 -right-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <Card className="border-border/50 bg-card/80 shadow-lg backdrop-blur-sm">
            <CardHeader className="space-y-0.5 pb-4 text-center">
              <CardTitle className="text-xl font-bold md:text-2xl">{copy.title}</CardTitle>
              <CardDescription className="text-xs md:text-sm">{copy.description}</CardDescription>
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
                    className="h-10 border-gray-300 text-sm"
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
                      className="h-10 border-gray-300 pr-10 text-sm"
                      disabled={isSubmitting}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                </div>

                {(error || errors.root) && (
                  <div className="rounded border border-red-200 bg-red-50 p-3">
                    <p className="text-center text-xs text-red-600 whitespace-pre-line">
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
                  className="h-10 w-full bg-dark-header text-sm text-white hover:bg-dark-footer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    copy.submitLabel
                  )}
                </Button>

                {copy.footerLinks.map((link) => (
                  <p key={link.href} className="text-center text-xs text-muted-foreground">
                    {link.text}{" "}
                    <Link
                      href={link.href}
                      className="font-medium text-blue-500 hover:text-blue-600 hover:underline"
                    >
                      {link.label}
                    </Link>
                  </p>
                ))}
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </HomeLayout>
  );
}
