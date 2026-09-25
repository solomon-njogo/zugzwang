import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "ZugZwang",
    short_name: "ZugZwang",
    description:
      "Diagnose the root cause behind dropped chess rating points.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#16130f",
    theme_color: "#16130f",
    lang: "en",
    dir: "ltr",
    categories: ["games", "education"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
