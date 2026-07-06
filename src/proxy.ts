import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/login")) {
        if (token) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        return NextResponse.next();
    }

    // tidak ada token
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/login",
        "/santri/:path*",
        "/guru/:path*",
        "/kategori-keuangan/:path*",
        "/keuangan-spp/:path*",
        "/keuangan-pembangunan/:path*",
        "/users/:path*",
        "/absensi/:path*",
        "/kelas/:path*",
        "/aset/:path*",
        "/activity-logs/:path*",
        "/profile/:path*",
    ],
};
