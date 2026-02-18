import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SyncSketch - Creative Whiteboard",
  description: "Create stunning visual diagrams, sketches, and illustrations with our intuitive whiteboard experience.",
  keywords: ["whiteboard", "diagrams", "sketches", "excalidraw", "drawing", "collaboration"],
  authors: [{ name: "SyncSketch" }],
  openGraph: {
    title: "SyncSketch - Creative Whiteboard",
    description: "Create stunning visual diagrams, sketches, and illustrations.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
