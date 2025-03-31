import { NextResponse } from "next/server";

export async function GET() {
    const MASTODON_INSTANCE = process.env.MASTODON_INSTANCE;
    const CLIENT_ID = process.env.MASTODON_CLIENT_ID;
    const REDIRECT_URI = process.env.MASTODON_REDIRECT_URI;
  
    if (!CLIENT_ID) {
      return new Response(JSON.stringify({ error: "Missing MASTODON_CLIENT_ID" }), { status: 500 });
    }
  
    const authUrl = `${MASTODON_INSTANCE}/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=write:statuses write:media read:statuses&response_type=code`;
  
    return NextResponse.redirect(authUrl);
  }
  