import { itemsConfig } from "@/config/itemsConfig";
import SectionTitle from "./SectionTitle";
import { IconUser } from "@tabler/icons-react";

function QualityFirstSection() {
  return (
    <section className="bg-background py-16 min-h-[50dvh] w-full">
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
        <div className="col-span-3 bg-secondary rounded-2xl">
          <p className="text-lg p-6">
            {/* TODO: Add a testimonial or quote here */}
          </p>

          <div className="flex items-center gap-4 p-6 border-t border-muted-foreground/20">
            <div className="bg-primary/10 w-fit p-2 rounded-md">
              <IconUser className="text-primary" />
            </div>
            <div>
              <p className="font-semibold">
                {/* TODO: Add a testimonial or quote here */}
              </p>
              <p className="text-sm text-muted-foreground">
                {/* TODO: Add a testimonial or quote here */}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-20">
        Trusted by teams building on an open foundation
      </p>
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
