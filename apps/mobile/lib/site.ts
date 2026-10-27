// The website that hosts the API routes the app calls (account registration,
// account deletion). Overridable per build for testing against a preview.
//
// Use the site's canonical host (www): a request to the bare domain is
// redirected there, and the phone's HTTP client drops the Authorization
// header when a redirect changes host, so authenticated calls (deleting the
// account) would arrive anonymous and be refused.
export const SITE_URL = (process.env.EXPO_PUBLIC_SITE_URL ?? "https://www.motqen.site").replace(/\/+$/, "");
