import type { Metadata } from "next";
import { Nunito, Patrick_Hand } from "next/font/google";
import "./globals.css";
import { OpeningProvider } from "@/components/opening/OpeningProvider";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const patrickHand = Patrick_Hand({
  variable: "--font-patrick-hand",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Nestly",
  description: "A cozy digital agenda",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} ${patrickHand.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <OpeningProvider>{children}</OpeningProvider>
      </body>
    </html>
  );
}