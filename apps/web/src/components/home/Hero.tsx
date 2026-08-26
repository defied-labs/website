import { Button } from "@/components/ui/button";
import Link from "next/link";
import LightRays from "@/components/LightRays";
import AnimatedHeadline from "@/components/home/AnimatedHeadline";

function Hero() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center pt-30 px-10 pb-25 min-h-screen">
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#10B981"
          raysSpeed={0.5}
          lightSpread={1.5}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.15}
          distortion={0}
          className="custom-rays dark:block hidden"
          pulsating
          fadeDistance={1}
          saturation={1}
        />
      </div>
      <div className="z-10 flex flex-col items-center justify-center gap-4 text-center">
        <AnimatedHeadline />
        <p className="max-w-175 text-lg text-muted-foreground sm:text-xl">
          Defied is an open-source oriented software development collective that
          builds high-quality software products and services for businesses and
          individuals.
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
            <h3 className="lg:text-[40px] text-2xl font-bold">4.2M</h3>
            <p className="text-muted-foreground text-sm font-semibold">
              npm installs / month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
