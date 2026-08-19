import type { Metadata } from "next";

import { Inter, Lora } from "next/font/google";

import "../index.css";
import Header from "@/components/header";
import Providers from "@/components/providers";
import { ModeToggle } from "@/components/mode-toggle";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${lora.variable} antialiased`}>
        <Providers>
          <div className="flex flex-col min-h-screen bg-background text-foreground items-center w-full h-full">
            <Header />
            {children}
            <Footer />
          </div>
          <ModeToggle />
        </Providers>
      </body>
    </html>
  );
}
