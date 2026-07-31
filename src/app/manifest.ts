import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PrintFlow Manager - Gerenciamento de Impressão 3D",
    short_name: "PrintFlow",
    description: "Sistema de gerenciamento para serviços de impressão 3D",
    start_url: "/",
    display: "standalone",
    background_color: "#050914",
    theme_color: "#050914",
    icons: [
      {
        src: "/icons/pwa-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/pwa-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
