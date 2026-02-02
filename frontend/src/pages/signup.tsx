import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Field from "@/components/Field";
import Layout from "@/components/Layout";
import { type SignupInput, useSignupMutation } from "@/graphql/generated/schema";

export default function Signup() {
  const router = useRouter();
  const [signup, { loading: isSubmitting, error }] = useSignupMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>();

  const onSubmit = async (data: SignupInput) => {
    try {
      await signup({ variables: { data } });
      alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout pageTitle="Inscription">
      <div className="p-4 max-w-[400px] mx-auto">
        <h2 className="text-xl font-bold my-6 text-center">Créer un compte</h2>
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

          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
            {isSubmitting ? "Inscription..." : "S'inscrire"}
          </button>
        </form>

        {error && (
          <p className="text-red-500 mt-4 text-center">
            {error.message || "Une erreur est survenue lors de l'inscription"}
          </p>
        )}
      </div>
    </Layout>
  );
}
