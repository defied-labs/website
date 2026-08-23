"use client";

import { Suspense } from "react";
import MagicLinkSignInContent from "./MagicLinkSignInContent";

export default function MagicLinkSignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MagicLinkSignInContent />
    </Suspense>
  );
}
