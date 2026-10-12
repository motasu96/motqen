// The website that hosts the API routes the app calls (account registration,
// account deletion). Overridable per build for testing against a preview.
export const SITE_URL = (process.env.EXPO_PUBLIC_SITE_URL ?? "https://motqen.site").replace(/\/+$/, "");
