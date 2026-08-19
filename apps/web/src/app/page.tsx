import Hero from "@/components/home/Hero";
import LetsBuildSection from "@/components/home/LetsBuildSection";
import ProjectsSection from "@/components/home/ProjectsSection";
import QualityFirstSection from "@/components/home/QualityFirstSection";
import StartSection from "@/components/home/StartSection";
import TodaySection from "@/components/home/TodaySection";

export default function Home() {
  return (
    <>
      <Hero />
      <StartSection />
      <ProjectsSection />
      <TodaySection />
      <QualityFirstSection />
      <LetsBuildSection />
    </>
  );
}
