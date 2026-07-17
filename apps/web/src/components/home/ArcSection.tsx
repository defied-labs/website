import SectionTitle from "./SectionTitle";
import { Card, CardContent, CardHeader } from "../ui/card";
import { itemsConfig } from "@/config/itemsConfig";

function ArcSection() {
  return (
    <section className="py-16 min-h-[50dvh] lg:w-[60%] w-full lg:mx-auto rounded-2xl lg:px-20 px-8 my-12">
      <SectionTitle className="text-center">
        <span>// The arc</span>
        <span>
          One codebase of principles, <br />
          three chapters of growth
        </span>
      </SectionTitle>
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mt-8">
        {itemsConfig.arcSection.map((item) => (
          <Card
            className="flex-1 p-6 bg-background rounded-lg border-primary/70 border hover:shadow-2xl transition-shadow duration-300 shadow-primary/50"
            key={item.id}
          >
            <CardHeader className="flex text-lg font-semibold justify-between items-center px-4">
              <div className="bg-primary w-fit p-2 rounded-md">{item.icon}</div>
              <p className="font-mono text-muted-foreground text-sm">
                {item.id}
              </p>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default ArcSection;
