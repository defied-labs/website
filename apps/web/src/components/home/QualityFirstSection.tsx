import { itemsConfig } from "@/config/itemsConfig";
import SectionTitle from "../ui/SectionTitle";

function QualityFirstSection() {
  return (
    <section className="bg-background py-16 w-full">
      <SectionTitle className="text-center">
        <span>// Quality First</span>
        <span>
          Open-source discipline, <br />
          <span className="text-primary italic">quality first</span>
        </span>
      </SectionTitle>

      <div className="lg:grid lg:grid-cols-3 flex flex-col gap-10 max-w-5xl mx-auto mt-8 px-16">
        {itemsConfig.qualityFirstSection.map((item) => (
          <div key={item.id} className="bg-muted p-6 rounded-2xl">
            <p className="text-4xl font-bold">{item.value}</p>
            <h3 className="text-sm font-medium text-muted-foreground">
              {item.label}
            </h3>
          </div>
        ))}
      </div>
      {/*       <LogoLoop
        logos={techLogos}
        speed={100}
        direction="left"
        logoHeight={60}
        gap={60}
        hoverSpeed={0}
        scaleOnHover
        fadeOut
        fadeOutColor="#ffffff"
        ariaLabel="Technology partners"
      /> */}
    </section>
  );
}

export default QualityFirstSection;
