import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ChatWidget from "@/components/chat/chat-widget";
import SiteNav from "@/components/nav/site-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vidya | Full-Stack + AI",
  description: "Portfolio of Vidya Gorji",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <SiteNav />
        <main id="home" className="relative z-10 isolate">
          <div className="app relative z-10 isolate">
            {children}
          </div>
        </main>
        <div id="chat" />
        <ChatWidget />
      </body>
    </html>
  );
}