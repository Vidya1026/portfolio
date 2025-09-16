import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import ChatWidget from "@/components/chat/chat-widget";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bhargava | Full-Stack + AI",
  description: "Portfolio of Gunapu Bhargava Sai Vardhan",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <header className="sticky top-0 z-50 w-full">
          <div className="glass border-b border-border/60 backdrop-blur-sm supports-[backdrop-filter]:bg-background/70">
            <nav role="navigation" className="container flex h-14 items-center justify-between">
              <Link href="/#home" className="font-semibold tracking-tight">Bhargava</Link>
              <div className="flex items-center gap-1">
                <a href="/#projects" className="px-3 py-2 rounded-md text-sm hover:bg-muted/30 transition">Projects</a>
                <a href="/#experience" className="px-3 py-2 rounded-md text-sm hover:bg-muted/30 transition">Experience</a>
                <a href="/#certifications" className="px-3 py-2 rounded-md text-sm hover:bg-muted/30 transition">Certifications</a>
                <a href="/#chat" className="px-3 py-2 rounded-md text-sm hover:bg-muted/30 transition">Chat</a>
              </div>
            </nav>
          </div>
        </header>
        <main id="home">{children}</main>
        <div id="chat" />
        <ChatWidget />
      </body>
    </html>
  );
}