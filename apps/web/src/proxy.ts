import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";

const isSignInPage = createRouteMatcher(["/auth"]);
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
      return nextjsMiddlewareRedirect(request, "/");
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
