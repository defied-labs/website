"use client";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";
import { ViewTransitions } from "next-view-transitions";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ViewTransitions>{children}</ViewTransitions>
      </ThemeProvider>
      <Toaster richColors />
    </>
  );
}
