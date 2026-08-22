import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

function redirectWithSessionCookies(
  request: NextRequest,
  pathname: string,
  response: NextResponse,
) {
  const redirectResponse = NextResponse.redirect(new URL(pathname, request.url));

  response.cookies
    .getAll()
    .forEach((cookie) => redirectResponse.cookies.set(cookie));

  return redirectResponse;
}

export async function proxy(request: NextRequest) {
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  const { response, userId } = await updateSession(request);
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === "/login" || pathname.startsWith("/auth/");
  const isApiRoute = pathname.startsWith("/api/");

  if (!userId && !isAuthPage && !isApiRoute) {
    return redirectWithSessionCookies(request, "/login", response);
  }

  if (userId && pathname === "/login") {
    return redirectWithSessionCookies(request, "/", response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
