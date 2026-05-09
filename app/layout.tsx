import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import type { ReactNode } from "react";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans"
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "Project Orchid | Your Singaporean Student Hub in the UK",
  description: "A UKSSC-operated platform for UK-based Singaporean student societies."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
