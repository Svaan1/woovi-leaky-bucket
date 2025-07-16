import { NextResponse, NextRequest } from "next/server";
import { parseCookies } from "nookies";

const authPages = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("woovi.token")?.value;
  const { pathname } = request.nextUrl;

  if (token && authPages.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!token && !authPages.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
