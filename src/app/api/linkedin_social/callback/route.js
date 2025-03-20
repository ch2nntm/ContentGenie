import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const url = new URL(req.url);
        const code = url.searchParams.get("code");

        if (!code) {
            return NextResponse.json({ error: "No authorization code found" }, { status: 400 });
        }

        // Lưu code vào cookie (giống như session)
        const response = NextResponse.json({ message: "Code saved successfully" }, { status: 200 });
        response.cookies.set("linkedin_code", code, { httpOnly: true, secure: true, path: "/" });

        return response;
    } catch (error) {
        console.error("Error handling LinkedIn callback:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
