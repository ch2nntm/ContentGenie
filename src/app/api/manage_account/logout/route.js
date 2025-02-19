import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const cookies = new Cookies(req);
        // cookies.set("token", "", { expires: new Date(0), httpOnly: true });
        cookies.remove("token", { path: "/" }); 

        return NextResponse.json({ message: "Signed out successfully!" }, { status: 200 });
    } catch (error) {
        console.error("Error while logging out:", error);
        return NextResponse.json({ error: "Server error when logging out!" }, { status: 500 });
    }
}
