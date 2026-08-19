"use client";
import { cn } from "@/lib/utils";
import React from "react";

function Terminal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const lines = entry.target.querySelectorAll(".terminal-line");
          lines.forEach((line, index) => {
            line.classList.add("animate-fade-in");
            (line as HTMLElement).style.animationDelay = `${index * 1.5}s`;
          });
          observer.unobserve(entry.target);
        }
      });
    });

    const terminal = document.querySelector(".terminal");
    if (terminal) {
      observer.observe(terminal);
    }
  }, []);

  return (
    <div
      className={cn(
        "bg-background font-mono flex flex-col gap-2 rounded-xl p-4 text-white text-sm overflow-x-auto h-full w-full terminal",
        className,
      )}
    >
      {children &&
        React.Children.map(children, (child, index) => (
          <div
            className="terminal-line animate-fade-in opacity-0"
            style={{ animationDelay: `${index * 1.5}s` }}
          >
            {child}
          </div>
        ))}
    </div>
  );
}

function TerminalLine({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>{children}</div>
  );
}

export { Terminal, TerminalLine };
