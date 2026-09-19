import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "متقن | Motqen",
    short_name: "متقن",
    description: "منصة متقن لتعليم القرآن الكريم عن بُعد، مجانية بالكامل.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FBF7EE",
    theme_color: "#C89B4A",
    lang: "ar",
    dir: "rtl",
    icons: [
      { src: "/icons/icon-192-any.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512-any.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
