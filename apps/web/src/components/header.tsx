"use client";
import Link from "next/link";
import { Button } from "./ui/button";

export default function Header() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
  ] as const;

  return (
    <header className="flex py-4.5 px-10 justify-evenly items-center border-b border-[#E6E8EC]/40 dark:border-[#2C2C2C]/40 sticky top-0 z-50 bg-background/90 backdrop-blur-[10px] w-full">
      <div className="whitespace-pre">
        <h1 className="text-xl font-bold">Defied</h1>
      </div>
      <div className="flex items-center gap-8 text-[15px] font-medium leading-[1.2em] text-[#5B6270] dark:text-[#D9D9D9]">
        {links.map((link) => (
          <Link
            key={link.to}
            href={link.to}
            className="hover:text-[#1A1A1A] dark:hover:text-[#FFFFFF] transition-colors duration-200"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <Link href="/auth/magic-link">
          <Button className="py-5.5 px-6 text-white text-[16px] font-semibold rounded-[10px] cursor-pointer tracking-tight box-b">
            Sign In
          </Button>
        </Link>
      </div>
    </header>
  );
}
