import  {cookies} from "next/headers";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const cookieStore = await cookies();
  
    if (!code) {
      return NextResponse.json({ status: "error", message: "Missing authorization code" }, { status: 400 });
    }
  
    const MASTODON_INSTANCE = process.env.MASTODON_INSTANCE;
    const CLIENT_ID = process.env.MASTODON_CLIENT_ID;
    const CLIENT_SECRET = process.env.MASTODON_CLIENT_SECRET;
    const REDIRECT_URI = process.env.MASTODON_REDIRECT_URI;

    console.log("MASTODON_INSTANCE: ",MASTODON_INSTANCE," - CLIENT_ID: ",CLIENT_ID," - CLIENT_SECRET: ",CLIENT_SECRET," - REDIRECT_URI: ",REDIRECT_URI);
  
    try {
      const tokenResponse = await fetch(`${MASTODON_INSTANCE}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: "authorization_code",
          code,
        }),
      });
  
      if (!tokenResponse.ok) {
        throw new Error("Failed to exchange token");
      }
  
      const tokenData = await tokenResponse.json();
      console.log("TOKEN DATA: ",tokenData);

      cookieStore.set("mastodon_token", tokenData.access_token, {
        path: "/",
        sameSite: "Lax",
      });

      const redirectParams = cookieStore.get("redirect_params_mastodon") || "";

      await redis.set(`mastodon_token:`, tokenData.access_token);

      if(!redirectParams){
        return Response.redirect(new URL(`/component/post_manage/list_post_user`, req.url), 302);
      }

      return Response.redirect(new URL(`/component/post_manage/preview?${redirectParams.value}`, req.url), 302);
    
    } catch (error) {
      console.error("Error exchanging token:", error);
      return NextResponse.json({ status: "error", message: error }, { status: 500 });
    }
  }
  