import type { Metadata } from "next";

import Header from "@/components/ui/header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Defied",
  description:
    "Defied is an open-source oriented software development collective that builds high-quality software products and services for businesses and individuals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground items-center w-full h-full">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
