import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/inter";
import "@/frontend/styles/globals.css";

export const metadata: Metadata = {
  title: "coy. — Discover",
  description: "A standalone Discover prototype for the Coy SDE assignment.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
