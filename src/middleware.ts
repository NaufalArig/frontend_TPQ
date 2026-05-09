import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const { pathname } = req.nextUrl;

    // boleh akses login
    if (pathname.startsWith("/login")) {
        return NextResponse.next();
    }

    // tidak ada token
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/santri/:path*", "/guru/:path*", "/keuangan/:path*"],
};