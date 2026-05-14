import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Autohaus Admin",
    short_name: "Autohaus",
    description: "Sistema administrativo para gestión vehicular, ventas y control financiero.",
    start_url: "/",
    display: "standalone",
    background_color: "#070707",
    theme_color: "#070707",
    orientation: "portrait",
    icons: [
      {
        src: "/logo-icon.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: "/logo-icon.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
    categories: ["business", "productivity"],
  };
}
