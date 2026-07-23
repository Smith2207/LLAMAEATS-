import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LlamaEats — Reservas de mesa en Puno",
    short_name: "LlamaEats",
    description: "Reserva tu mesa en los mejores restaurantes de Puno en minutos.",
    start_url: "/restaurante/reservas",
    scope: "/",
    display: "standalone",
    background_color: "#0b1f33",
    theme_color: "#a83e22",
    icons: [
      { src: "/pwa-icon-192", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icon-512", sizes: "512x512", type: "image/png" },
    ],
  };
}
