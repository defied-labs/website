import FaultyTerminal from "@/components/FaultyTerminal";

export default function MagicLinkSignInContent() {
  return (
    <div className="grid grid-cols-3 h-screen w-full">
      <div className="bg-secondary shadow-[inset_0_0_30px_0_rgba(0,0,0,0.5)] w-full lg:col-span-1 col-span-3">
        <div className="flex flex-col items-center justify-center h-full gap-2 px-6 text-center">
          <h1 className="text-2xl font-bold">Login unavailable</h1>
          <p className="text-muted-foreground">
            Sign in is currently not available. Please check back soon.
          </p>
        </div>
      </div>
      <div className="col-span-2 w-full lg:flex hidden">
        <FaultyTerminal
          scale={2.2}
          gridMul={[2, 1]}
          digitSize={1.4}
          timeScale={0.2}
          pause={false}
          scanlineIntensity={0.5}
          glitchAmount={1}
          flickerAmount={1}
          noiseAmp={1}
          chromaticAberration={0}
          dither={0}
          curvature={0}
          tint="#1db6a5"
          mouseReact
          mouseStrength={0.2}
          pageLoadAnimation
          brightness={0.8}
        />
      </div>
    </div>
  );
}
