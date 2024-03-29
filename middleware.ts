import { NextRequest, NextResponse } from "next/server";

const ignorePathPrefix = ["/_next", "/assets", "/favicon.ico", "/vercel.svg"];
const isPathIgnorable = (path: string) =>
  ignorePathPrefix.some((prefix) => path.startsWith(prefix));

export function middleware(req: NextRequest) {
  if (!isPathIgnorable(req.nextUrl.pathname)) {
  }

  const response = NextResponse.next();

  if (req.nextUrl.pathname.startsWith("/api")) {
    response.headers.append(
      "Access-Control-Allow-Origin",
      req.headers.get("origin") || "*"
    );

    response.headers.append("Access-Control-Allow-Credentials", "true");
    response.headers.append("Vary", "Origin");

    response.headers.append(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.append(
      "Access-Control-Allow-Headers",
      "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Requested-With"
    );
    if (req.method == "OPTIONS") {
      return response;
    }

    response.headers.append("Content-Type", "application/json");
  }

  return response;
}