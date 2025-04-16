import  {cookies} from "next/headers";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const cookieStore = await cookies();
  
    if (!code) {
      return new Response(JSON.stringify({ error: "Missing authorization code" }), { status: 400 });
    }
  
    const LINKEDIN_INSTANCE = process.env.LINKEDIN_INSTANCE;
    const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
    const CLIENT_SECRET = "WPL_AP1.zXKedn8X5A1jLaA4.9+fuLA==";
    const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;
    console.log("Authorization Code:", code);
    console.log("LINKEDIN_INSTANCE:", LINKEDIN_INSTANCE);
    console.log("CLIENT_ID:", CLIENT_ID);
    console.log("CLIENT_SECRET:", CLIENT_SECRET);
    console.log("REDIRECT_URI:", REDIRECT_URI);
  
    try {
      const tokenResponse = await fetch(`${LINKEDIN_INSTANCE}/oauth/v2/accessToken`, {
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
      
    cookieStore.set("linkedin_access_token", tokenData.access_token, {
      path: "/",
      sameSite: "Lax",
    });

    cookieStore.set("linkedin_id_token", tokenData.id_token, {
      path: "/",
      sameSite: "Lax",
    });

    await redis.set(`linkedin_token:`, tokenData.access_token);
    const redirectParams = cookieStore.get("redirect_params_linkedin") || "";
    if(!redirectParams){
      return Response.redirect(new URL(`/component/post_manage/list_post_user`, req.url), 302);
    }

    return Response.redirect(new URL(`/component/post_manage/preview_linkedin?${redirectParams.value}`, req.url), 302);
    } catch (error) {
      console.error("Error exchanging token:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error: "+error }), { status: 500 });
    }
  }
  