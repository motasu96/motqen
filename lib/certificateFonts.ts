import { Amiri, IBM_Plex_Sans_Arabic } from "next/font/google";

// Scoped to the certificate template only — the rest of the site uses
// Tajawal, but the certificate design specifically calls for these.
export const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-arabic",
  display: "swap",
});
