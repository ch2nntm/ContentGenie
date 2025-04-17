import { NextResponse } from "next/server";
import { serialize } from "cookie";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

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

        serialize("redirect_params_mastodon", "", {
            path: "/",
            sameSite: "strict",
            expires: new Date(0)
        }),

        serialize("redirect_params_linkedin", "", {
            path: "/",
            sameSite: "strict",
            expires: new Date(0)
        }),

        serialize("token", "", {
            path: "/",
            sameSite: "strict",
            expires: new Date(0)
        }),
    ]
    await redis.del(`linkedin_token:`);
    await redis.del(`mastodon_token:`);

    const response = new NextResponse("Logged out", { status: 200 });
    response.headers.set("Set-Cookie", logoutCookie);
    return response;
}
