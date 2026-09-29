import { useSearchParams } from "next/navigation";
import FaultyTerminal from "@/components/FaultyTerminal";
import LoginForm from "@/components/LoginForm";

export default function MagicLinkSignInContent() {
  const searchParams = useSearchParams();

  return (
    <div className="grid grid-cols-3 h-screen w-full">
      <LoginForm searchParams={searchParams} />
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
