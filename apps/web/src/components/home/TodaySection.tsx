import SectionTitle from "@/components/home/SectionTitle";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { itemsConfig } from "@/config/itemsConfig";

function TodaySection() {
  return (
    <section className="bg-muted py-16 min-h-[50dvh] w-full">
      <SectionTitle className="text-center">
        <span>// Today</span>
        <span>
          AI-oriented services,
          <br />
          enterprise discipline
        </span>
      </SectionTitle>

      <div className="grid lg:grid-cols-3 gap-10 max-w-5xl mx-auto mt-8 px-16">
        {itemsConfig.todaySection.map((item) => (
          <Card className="bg-background p-6 rounded-2xl" key={item.id}>
            <CardHeader className="flex text-lg font-semibold justify-between items-center px-4">
              <div className="bg-primary/10 w-fit p-2 rounded-md">
                {item.icon}
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default TodaySection;
