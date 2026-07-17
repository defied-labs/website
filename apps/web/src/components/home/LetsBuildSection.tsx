import Link from "next/link";
import SectionTitle from "./SectionTitle";
import { Button } from "@base-ui/react/button";

function LetsBuildSection() {
  return (
    <section className="bg-foreground py-16 min-h-[55dvh] w-full flex flex-col items-center justify-center ">
      <SectionTitle className="text-center">
        <span>// Let's build</span>
        <span className="text-background text-5xl">
          Ready for enterprise AI that <br />
          started as open source?
        </span>
      </SectionTitle>

      <div className="mt-8 gap-4 text-muted/70 text-center">
        <p>
          Tell us what you’re building. We’ll show you how
          <br /> open, quality-first engineering gets you there faster.
        </p>

        <div className="flex gap-4 mt-4 items-center justify-center ">
          <Link href="/contact">
            <Button className="bg-primary text-background px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors cursor-pointer">
              Book a call
            </Button>
          </Link>
          <Link href="https://github.com/defied" target="_blank">
            <Button className="bg-background text-primary px-6 py-3 rounded-lg font-semibold hover:bg-muted transition-colors cursor-pointer">
              View our repos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default LetsBuildSection;
