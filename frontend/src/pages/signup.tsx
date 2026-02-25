import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Field from "@/components/Field";
import HomeLayout from "@/components/HomeLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type SignupInput, useSignupMutation } from "@/graphql/generated/schema";

type SignupFormValues = SignupInput & { confirmPassword: string };

export default function Signup() {
  const router = useRouter();
  const [signup, { loading: isSubmitting, error }] = useSignupMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>();

  const passwordValue = watch("password");

  const onSubmit = async (data: SignupFormValues) => {
    try {
      const { confirmPassword, ...signupData } = data;
      void confirmPassword;

      await signup({ variables: { data: signupData } });
      alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <HomeLayout pageTitle="Inscription">
      <div className="flex justify-center items-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Créer un compte</CardTitle>
            <CardDescription>
              Remplissez les informations ci-dessous pour vous inscrire
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Field
                label="Email"
                inputProps={{
                  ...register("email", {
                    required: "L'email est requis",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "L'email n'est pas valide",
                    },
                  }),
                  type: "email",
                  placeholder: "votre.email@example.com",
                }}
                id="email"
                error={errors.email?.message}
              />

              <Field
                label="Mot de passe"
                inputProps={{
                  ...register("password", {
                    required: "Le mot de passe est requis",
                    minLength: {
                      value: 8,
                      message: "Le mot de passe doit contenir au moins 8 caractères",
                    },
                    maxLength: {
                      value: 128,
                      message: "Le mot de passe ne peut pas dépasser 128 caractères",
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message:
                        "Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial",
                    },
                  }),
                  type: "password",
                  placeholder: "Votre mot de passe sécurisé",
                }}
                id="password"
                error={errors.password?.message}
              />

              <Field
                label="Confirmer le mot de passe"
                inputProps={{
                  ...register("confirmPassword", {
                    required: "La confirmation du mot de passe est requise",
                    validate: (value) =>
                      value === passwordValue ||
                      "Les 2 saisies de mot de passe doivent être identiques",
                  }),
                  type: "password",
                  placeholder: "Confirmez votre mot de passe",
                }}
                id="confirmPassword"
                error={errors.confirmPassword?.message}
              />

              <CardFooter className="flex flex-col gap-4 px-0">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 text-sm bg-dark-header text-white hover:bg-dark-footer"
                >
                  {isSubmitting ? "Inscription..." : "S'inscrire"}
                </button>

                {error && (
                  <p className="text-red-500 text-center text-sm">
                    {error.message || "Une erreur est survenue lors de l'inscription"}
                  </p>
                )}

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
          </CardContent>
        </Card>
      </div>
    </HomeLayout>
  );
}
