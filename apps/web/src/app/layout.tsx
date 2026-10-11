import type { Metadata } from "next";
import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import "@fontsource-variable/inter";
import "@fontsource-variable/newsreader";

export const metadata: Metadata = {
  title: "unfold",
  description: "A collaborative drawing canvas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="unfold-ui-theme">
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
