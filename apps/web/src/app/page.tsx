import ArcSection from "@/components/home/ArcSection";
import Hero from "@/components/home/Hero";
import LetsBuildSection from "@/components/home/LetsBuildSection";
import QualityFirstSection from "@/components/home/QualityFirstSection";
import StartSection from "@/components/home/StartSection";
import TodaySection from "@/components/home/TodaySection";

export default function Home() {
  return (
    <>
      <Hero />
      <StartSection />
      <ArcSection />
      <TodaySection />
      <QualityFirstSection />
      <LetsBuildSection />
    </>
  );
}
