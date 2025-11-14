import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";

const isSignInPage = createRouteMatcher(["/auth"]);
const isDeviceAuthPage = createRouteMatcher(["/auth/device"]);
const isPublicRoute = createRouteMatcher(["/"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const url = request.nextUrl;

  if (request.nextUrl.pathname === "/sw.js") {
    return new NextResponse("Not worker found", { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams.toString();
  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }
  if (path.includes("opengraph-image")) {
    return NextResponse.next();
  }

  const isAuthenticated = await convexAuth.isAuthenticated();

  if (isSignInPage(request)) {
    if (isAuthenticated) {
      // If there's a redirect parameter, use it; otherwise go to home
      const redirectParam = url.searchParams.get("redirect");
      const destination = redirectParam || "/";
      return nextjsMiddlewareRedirect(request, destination);
    }

    return NextResponse.next();
  }

  // Allow device auth page only for authenticated users
  if (isDeviceAuthPage(request)) {
    if (!isAuthenticated) {
      const userCode = url.searchParams.get("userCode");

      // Construct the full device auth path with userCode parameter
      const deviceAuthPath = userCode
        ? `/auth/device?userCode=${userCode}`
        : "/auth/device";

      // Build the redirect URL
      const redirectUrl = new URL("/auth", request.url);
      redirectUrl.searchParams.set("redirect", deviceAuthPath);

      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  if (!isSignInPage(request) && !isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/auth");
  }
  return NextResponse.next();
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
