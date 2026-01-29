import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Field from "@/components/Field";
import Layout from "@/components/Layout";
import { type LoginInput, useLoginMutation } from "@/graphql/generated/schema";

export default function Login() {
  const router = useRouter();
  const [login, { loading: isSubmitting, error }] = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>();

  const onSubmit = async (data: LoginInput) => {
    try {
      await login({ variables: { data } });
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout pageTitle="Connexion">
      <div className="p-4 max-w-[400px] mx-auto">
        <h2 className="text-xl font-bold my-6 text-center">Se connecter</h2>
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
              placeholder: "Votre mot de passe",
            }}
            id="password"
            error={errors.password?.message}
          />

          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Pas encore de compte ?{" "}
            <a href="/signup" className="text-blue-600 hover:underline">
              S'inscrire
            </a>
          </p>
        </div>

        {error && (
          <p className="text-red-500 mt-4 text-center">
            {error.message || "Une erreur est survenue lors de la connexion"}
          </p>
        )}
      </div>
    </Layout>
  );
}
