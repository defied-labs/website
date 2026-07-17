import { itemsConfig } from "@/config/itemsConfig";
import SectionTitle from "./SectionTitle";
import { IconUser } from "@tabler/icons-react";

function QualityFirstSection() {
  return (
    <section className="bg-background py-16 min-h-[50dvh] w-full">
      <SectionTitle className="text-center">
        <span>// Quality First</span>
        <span>
          Enterprise trust is <br />
          earned in the details
        </span>
      </SectionTitle>

      <div className="grid lg:grid-cols-3 gap-10 max-w-5xl mx-auto mt-8 px-16">
        {itemsConfig.qualityFirstSection.map((item) => (
          <div key={item.id} className="bg-muted p-6 rounded-2xl">
            <p className="text-4xl font-bold">{item.value}</p>
            <h3 className="text-sm font-medium text-muted-foreground">
              {item.label}
            </h3>
          </div>
        ))}
        <div className="col-span-3 bg-foreground rounded-2xl">
          <p className="text-lg text-background p-6">
            “Defied’s open source discipline is why we trusted them with a
            system that can’t go down. They ship like engineers, not like a
            vendor.”
          </p>

          <div className="flex items-center gap-4 p-6 border-t border-muted">
            <div className="bg-primary/10 w-fit p-2 rounded-md">
              <IconUser className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-background">John Doe</p>
              <p className="text-sm text-background/80">
                Chief Technology Officer, TechCorp
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-40">
        Trusted by teams building on open foundation
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
