import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Color Archive",
  description: "Sort your images by color automatically.",
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