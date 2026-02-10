import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const router = useRouter();

  const handleRequestDemo = () => {
    // Redirection vers la page de signup avec un paramètre pour indiquer qu'il s'agit d'une demande de démo
    router.push("/signup?demo=true");
  };

  const handleTryFree = () => {
    // Redirection vers la page d'inscription
    router.push("/signup");
  };

  return (
    <section className="relative w-full h-1/2 flex items-center justify-center overflow-hidden shrink-0 min-h-0">
      {/* Background avec image culinaire */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-dark-base"
        style={{
          backgroundImage: "url('/MyDietChef_image.png')",
        }}
      >
        {/* Overlay sombre pour améliorer la lisibilité du texte */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 md:px-8 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
          Bienvenue sur MyDietChef
        </h1>
        <p className="text-base md:text-lg lg:text-xl text-white mb-8 md:mb-12">
          Plateforme conçue pour vous aider à atteindre vos objectifs diététiques
        </p>

        {/* Buttons */}
        <div className="flex flex-row gap-2 md:gap-4 justify-center items-center px-2">
          <Button
            type="button"
            onClick={handleRequestDemo}
            variant="secondary"
            size="sm"
            className="bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300 text-xs md:text-sm px-3 md:px-6 py-2 md:py-3"
          >
            Demander une démo
          </Button>
          <Button
            type="button"
            onClick={handleTryFree}
            size="sm"
            className="bg-success text-white hover:bg-success-hover text-xs md:text-sm px-3 md:px-6 py-2 md:py-3"
          >
            Essayez gratuitement
          </Button>
        </div>
      </div>
    </section>
  );
}
