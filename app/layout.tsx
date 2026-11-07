import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { ViewTransition } from "react";
import { site } from "@/content/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: site.name, template: `%s — ${site.name}` },
  description: `${site.name} — ${site.tagline} Projects, papers, drawings and sketchbooks.`,
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfd" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body>
        <ViewTransition>{children}</ViewTransition>
      </body>
    </html>
  );
}
