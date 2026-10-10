import type { Metadata } from "next";
import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import "@fontsource-variable/inter";

export const metadata: Metadata = {
  title: "SyncSketch",
  description: "A collaborative drawing canvas",
  icons: { icon: "/pwa-assets/Excalidraw-pp.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="syncsketch-ui-theme">
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
