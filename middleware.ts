import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/",
    "/(ar|en)/:path*",
    "/((?!api|dashboard|admin|_next|_vercel|images|.*\\..*).*)",
  ],
};
