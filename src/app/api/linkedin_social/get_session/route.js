import { NextResponse } from "next/server";

export async function GET(req) {
    const linkedinCode = req.cookies.get("linkedin_code");

    if (!linkedinCode) {
        return NextResponse.json({ error: "No LinkedIn code found" }, { status: 404 });
    }

    return NextResponse.json({ code: linkedinCode }, { status: 200 });
}
