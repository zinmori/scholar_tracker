import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Scholar Tracker - Gérez vos candidatures",
  description:
    "Application premium pour tracker vos candidatures universitaires et bourses d'études",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={plusJakartaSans.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
