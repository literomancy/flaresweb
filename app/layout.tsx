import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "@flaresagency",
  description: "flares agency ??",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}