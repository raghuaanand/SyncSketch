import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "unfold",
    short_name: "unfold",
    description: "A collaborative drawing canvas",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FAF9F5",
    theme_color: "#BC5638",
    icons: [
      { src: "/pwa-assets/pwa-64x64.png", sizes: "64x64", type: "image/png" },
      { src: "/pwa-assets/pwa-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa-assets/pwa-512x512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/pwa-assets/maskable-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
