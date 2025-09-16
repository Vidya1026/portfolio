"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function SiteNav() {
  // simple anchor nav; we can add active-link highlight later
  const link = "px-3 py-2 rounded-md text-sm hover:bg-muted/30 transition";
  return (
    <header className="sticky top-0 z-50 w-full">
      <div
        className={cn(
          "glass border-b border-border/60",
          "backdrop-blur-xs supports-[backdrop-filter]:bg-background/70"
        )}
      >
        <nav className="container flex h-14 items-center justify-between">
          <Link href="/#home" className="font-semibold tracking-tight">
            Bhargava
          </Link>

          <div className="flex items-center gap-1">
            <a href="/#projects" className={link}>Projects</a>
            <a href="/#experience" className={link}>Experience</a>
            <a href="/#certifications" className={link}>Certifications</a>
            <a href="/#chat" className={link}>Chat</a>
          </div>
        </nav>
      </div>
    </header>
  );
}
export default SiteNav;