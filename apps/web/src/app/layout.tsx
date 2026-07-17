import type { Metadata } from "next";

import { Inter } from "next/font/google";

import "../index.css";
import Header from "@/components/header";
import Providers from "@/components/providers";
import { ModeToggle } from "@/components/mode-toggle";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "defied",
  description: "defied",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
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
