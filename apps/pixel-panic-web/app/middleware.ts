import { type NextRequest, NextResponse } from "next/server";
import { auth } from "./auth"; // Assuming auth.ts is in your project root

/**
 * Checks if the requested path is part of the admin dashboard.
 * @param pathname The path from the request URL.
 * @returns `true` if the path is an admin route.
 */
function isAdminRoute(pathname: string): boolean {
  const adminRoutes = [
    "/dashboard",
    "/orders",
    "/pricing",
    "/technicians",
    "/customers",
    "/analytics",
    "/settings",
  ];
  // Check if the path starts with any of the defined admin routes.
  return adminRoutes.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. If the request is for an admin route, apply protection logic.
  if (isAdminRoute(pathname)) {
    const session = await auth();

    // 2. Check if the user is authenticated and has the 'admin' role.
    // Note: You must expose the 'role' in your auth.js session callback.
    // @ts-ignore
    const isAuthorized = session?.user && session.user?.role === "admin";

    if (!isAuthorized) {
      // 3. If not authorized, redirect to the login page.
      // We add a callbackUrl so the user is redirected back after a successful login.
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. If it's not a protected admin route, or if the user is an authorized admin, allow the request.
  return NextResponse.next();
}

// The matcher configuration remains the same, as it correctly
// excludes API routes, static files, and images from the middleware.
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
