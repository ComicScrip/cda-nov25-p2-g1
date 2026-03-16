import { Camera, ChevronRight, Target, TrendingUp, UtensilsCrossed } from "lucide-react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Camera,
    title: "Scannez vos repas",
    description:
      "Prenez une photo de votre assiette : l’IA identifie les aliments et estime les quantités pour un suivi simple au quotidien.",
    bg: "bg-[#bfe8ea]",
    border: "border-[#d3d8cf]",
    iconBg: "bg-white/90 border-[#cfd5cc]",
    textColor: "text-[#2e3a2d]",
  },
  {
    icon: UtensilsCrossed,
    title: "Analyse nutritionnelle",
    description:
      "Calories, protéines, glucides, lipides et conseils personnalisés pour mieux comprendre l’impact de vos repas.",
    bg: "bg-[#a7d9a1]",
    border: "border-[#d3d8cf]",
    iconBg: "bg-white/90 border-[#cfd5cc]",
    textColor: "text-[#2e3a2d]",
  },
  {
    icon: Target,
    title: "Accompagnement coach",
    description:
      "Un coach dédié commente vos repas, ajuste les calories si besoin et vous guide vers vos objectifs.",
    bg: "bg-[#e9b26b]",
    border: "border-[#d3d8cf]",
    iconBg: "bg-white/90 border-[#cfd5cc]",
    textColor: "text-[#2e3a2d]",
  },
  {
    icon: TrendingUp,
    title: "Suivi et évolution",
    description:
      "Visualisez votre progression, vos repas enregistrés et gardez la motivation sur la durée.",
    bg: "bg-[#eef4e8]",
    border: "border-[#73916f]/50",
    iconBg: "bg-white/90 border-[#73916f]/40",
    textColor: "text-[#2e3a2d]",
  },
];

export default function PlatformPreviewSection() {
  const router = useRouter();

  return (
    <section
      className="w-full py-12 md:py-16 px-4 md:px-6 border-b border-[#d3d8cf] bg-[#f5fbf1]"
      aria-labelledby="platform-preview-heading"
    >
      <div className="max-w-5xl mx-auto">
        <h2
          id="platform-preview-heading"
          className="text-2xl md:text-3xl font-bold text-[#2c2c2c] text-center mb-3"
        >
          Découvrez ce qui vous attend
        </h2>
        <p className="text-center text-[#5a6758] text-sm md:text-base max-w-2xl mx-auto mb-10 md:mb-12">
          MyDietChef vous accompagne au quotidien pour mieux manger et atteindre vos objectifs.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className={`rounded-md border ${item.border} ${item.bg} p-4 md:p-5 text-left shadow-[0_2px_4px_rgba(0,0,0,0.2)] hover:shadow-[0_3px_6px_rgba(0,0,0,0.12)] transition-shadow duration-200`}
              >
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-md border ${item.iconBg} text-[#1e4a1e] mb-3`}
                >
                  <Icon className="w-5 h-5" aria-hidden />
                </div>
                <h3 className={`font-semibold ${item.textColor} text-sm md:text-base mb-2`}>
                  {item.title}
                </h3>
                <p className="text-[#41543f] text-xs md:text-sm leading-relaxed">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-10 md:mt-12 text-center">
          <p className="text-[#5a6758] text-sm mb-4">Prêt à essayer ?</p>
          <Button
            type="button"
            onClick={() => router.push("/signup")}
            className="bg-[#73916f] text-white hover:bg-[#5a7356] font-medium px-6 py-3 rounded-md border-0 shadow-[0_2px_4px_rgba(0,0,0,0.2)] hover:shadow-[0_3px_6px_rgba(0,0,0,0.12)] hover:scale-[1.02] transition-all duration-200 inline-flex items-center gap-2"
          >
            Créer mon compte gratuit
            <ChevronRight className="w-4 h-4" aria-hidden />
          </Button>
        </div>
      </div>
    </section>
  );
}
