"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import MagicLinkSuccessContent from "./MagicLinkSuccessContent";

export default function MagicLinkSuccess() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MagicLinkSuccessContent />
    </Suspense>
  );
}
