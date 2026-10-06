import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Gate /admin routes: require the httpOnly `token` cookie set by the Express API.
// Full role checks happen server-side in the API; this keeps logged-out users out fast.
export function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const isLogin = req.nextUrl.pathname === "/admin/login";
  if (!token && !isLogin) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  if (token && isLogin) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
