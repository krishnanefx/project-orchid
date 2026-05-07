import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Orchid",
  description: "A UKSSC-operated platform for UK-based Singaporean student societies."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
