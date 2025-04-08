import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST() {
    const logoutCookie = [
        serialize("next-auth.session-token", "", {
            path: "/",
            sameSite: "strict",
            expires: new Date(0)
        }),

        serialize("mastodon_token", "", {
            path: "/",
            sameSite: "strict",
            expires: new Date(0)
        }),

        serialize("linkedin_access_token", "", {
            path: "/",
            sameSite: "strict",
            expires: new Date(0)
        }),

        serialize("linkedin_id_token", "", {
            path: "/",
            sameSite: "strict",
            expires: new Date(0)
        }),

        serialize("redirect_params", "", {
            path: "/",
            sameSite: "strict",
            expires: new Date(0)
        }),
    ]

    const response = new NextResponse("Logged out", { status: 200 });
    response.headers.set("Set-Cookie", logoutCookie);
    return response;
}
