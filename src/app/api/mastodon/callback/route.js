import  {cookies} from "next/headers";
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const referer = req.headers.get("referer");

    console.log("Request đến từ:", referer);
  
    if (!code) {
      return new Response(JSON.stringify({ error: "Missing authorization code" }), { status: 400 });
    }
  
    const MASTODON_INSTANCE = process.env.MASTODON_INSTANCE;
    const CLIENT_ID = process.env.MASTODON_CLIENT_ID;
    const CLIENT_SECRET = process.env.MASTODON_CLIENT_SECRET;
    const REDIRECT_URI = process.env.MASTODON_REDIRECT_URI;
  
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

      cookies().set("mastodon_token", tokenData.access_token, {
        path: "/",
        sameSite: "Lax",
    });

      const redirectParams = cookies().get("redirect_params") || "";

      console.log("redirectParams: ",redirectParams.value);
      return Response.redirect(new URL(`/component/post_manage/preview?${redirectParams.value}`, req.url), 302);
    
   
      // return Response.redirect(new URL(`/component/post_manage/list_post_user`, req.url), 302);
    
  
    } catch (error) {
      console.error("Error exchanging token:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
  }
  