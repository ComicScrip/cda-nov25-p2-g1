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
    <section className="relative w-full flex items-center justify-center overflow-hidden shrink-0 min-h-[70vh] md:min-h-0 md:h-1/2 border-b-2 border-[#2d5a2d]/40 py-6 md:py-0">
      {/* Background avec image culinaire */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-dark-base"
        style={{
          backgroundImage: "url('/MyDietChef_image.webp')",
        }}
      >
        {/* Overlay sombre pour améliorer la lisibilité du texte */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content avec bordure — optimisé mobile */}
      <div className="relative z-10 text-center w-[92%] max-w-4xl mx-auto px-4 py-6 sm:px-5 sm:py-7 md:px-10 md:py-10 rounded-xl border-2 border-white/30 bg-black/20 shadow-xl backdrop-blur-sm">
        <h1 className="text-2xl leading-tight sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 md:mb-6">
          Bienvenue sur MyDietChef
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/95 mb-6 sm:mb-8 md:mb-12 leading-snug max-w-xl mx-auto">
          Plateforme conçue pour vous aider à atteindre vos objectifs diététiques
        </p>

        {/* Buttons — empilés sur mobile, côte à côte sur desktop */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-stretch sm:items-center">
          <Button
            type="button"
            onClick={handleRequestDemo}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto border-2 border-white/70 bg-transparent text-white hover:bg-white/15 text-xs md:text-sm px-4 md:px-6 py-3 sm:py-2.5 md:py-3 rounded-lg min-h-[44px] sm:min-h-0"
          >
            Demander une démo
          </Button>
          <Button
            type="button"
            onClick={handleTryFree}
            size="lg"
            className="w-full sm:w-auto bg-white text-[#1e4a1e] hover:bg-white/95 font-semibold text-sm md:text-base px-6 md:px-8 py-3.5 sm:py-3 md:py-4 rounded-xl border-2 border-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 min-h-[48px] sm:min-h-0"
          >
            Essayez gratuitement
          </Button>
        </div>
      </div>
    </section>
  );
}
