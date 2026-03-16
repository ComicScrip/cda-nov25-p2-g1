import HeroSection from "@/components/HeroSection";
import HomeLayout from "@/components/HomeLayout";
import PlatformPreviewSection from "@/components/PlatformPreviewSection";

export default function Home() {
  return (
    <HomeLayout pageTitle="Accueil">
      <HeroSection />
      <PlatformPreviewSection />
    </HomeLayout>
  );
}
