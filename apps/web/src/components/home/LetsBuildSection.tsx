import Link from "next/link";
import SectionTitle from "./SectionTitle";
import { Button } from "@/components/ui/button";

function LetsBuildSection() {
  return (
    <section className="bg-secondary py-16 min-h-[55dvh] w-full flex flex-col items-center justify-center ">
      <SectionTitle className="text-center">
        <span>// Let's build</span>
        <span>
          Ready for enterprise AI that <br />
          started as open source?
        </span>
      </SectionTitle>

      <div className="mt-8 gap-4 text-center">
        <p className="text-lg text-muted-foreground sm:text-lg">
          Tell us what you're building. We'll show you how
          <br /> open, quality-first engineering gets you there faster.
        </p>

        <div className="flex gap-4 mt-4 items-center justify-center ">
          <Link href="/contact">
            <Button className="py-5.5 px-6 text-white text-[16px] font-semibold rounded-[10px] cursor-pointer tracking-tight box-border">
              Book a call
            </Button>
          </Link>
          <Link href="https://github.com/defied-labs" target="_blank">
            <Button
              variant="outline"
              className="py-5.5 px-6 text-[16px] font-semibold rounded-[10px] cursor-pointer tracking-tight box-border"
            >
              View our repos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default LetsBuildSection;
