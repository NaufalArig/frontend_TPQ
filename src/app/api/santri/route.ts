import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
    const user = getUserFromRequest(req);

    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!["admin", "guru"].includes(user.role || "")) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
        data: "Ini data santri (protected)",
    });
}