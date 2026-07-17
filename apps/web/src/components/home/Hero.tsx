import { IconGitBranch } from "@tabler/icons-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import MagicRings from "../MagicRings";
import Link from "next/link";

function Hero() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center pt-30 px-10 pb-25 min-h-[80dvh]">
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <MagicRings
          color="#10B981"
          colorTwo="#06B6D4"
          ringCount={6}
          speed={1}
          attenuation={12}
          lineThickness={1}
          baseRadius={0.32}
          radiusStep={0.1}
          scaleRate={0.1}
          opacity={1}
          blur={0}
          noiseAmount={0}
          rotation={0}
          ringGap={1.6}
          fadeIn={0.7}
          fadeOut={0.5}
          followMouse={false}
          mouseInfluence={0.2}
          hoverScale={1.2}
          parallax={0.065}
          clickBurst
        />
      </div>
      <Badge className="text-[13px] font-medium font-mono bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary px-2.5 py-1.5 rounded-full flex items-center gap-1.5">
        <IconGitBranch width={16} height={16} />
        Est. as an open-source collective
      </Badge>
      <h1 className="text-3xl font-bold tracking-tight sm:text-6xl">
        From open code to <br />
        <span className="text-primary">enterprise-grade AI</span>
      </h1>
      <p className="max-w-175 text-lg text-muted-foreground sm:text-xl">
        Defied began as a small open source software house. Today we build
        on-demand, AI-oriented systems for companies that refuse to compromise
        on quality.
      </p>
      <div className="flex gap-4 mt-6 z-10">
        <Link className="w-fit" href="/auth/magic-link">
          <Button className="bg-primary text-white py-5.5 px-6 text-[16px] font-semibold rounded-[10px] cursor-pointer tracking-tight ">
            Get Started
          </Button>
        </Link>

        <Button
          variant="outline"
          className="py-5.5 px-6 text-[16px] font-semibold rounded-[10px] cursor-pointer tracking-tight box-b"
        >
          Learn More
        </Button>
      </div>
      <div className="flex flex-wrap md:gap-14 gap-8 justify-center pt-12">
        <div className="">
          <h3 className="lg:text-[40px] text-2xl font-bold">12k+</h3>
          <p className="text-muted-foreground text-sm font-semibold">
            GitHub Stars
          </p>
        </div>
        <div className="">
          <h3 className="lg:text-[40px] text-2xl font-bold">40+</h3>
          <p className="text-muted-foreground text-sm font-semibold">
            Open Source Projects
          </p>
        </div>
        <div className="">
          <h3 className="lg:text-[40px] text-2xl font-bold">99.98%</h3>
          <p className="text-muted-foreground text-sm font-semibold">
            Enterprise uptime
          </p>
        </div>
      </div>
    </div>
  );
}

export default Hero;
