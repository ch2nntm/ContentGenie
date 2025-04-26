import { NextResponse } from "next/server";

export async function GET() {
    const MASTODON_INSTANCE = process.env.MASTODON_INSTANCE;
    const CLIENT_ID = process.env.MASTODON_CLIENT_ID;
    const REDIRECT_URI = process.env.MASTODON_REDIRECT_URI;
    const SCOPE = process.env.MASTODON_SCOPE;
    console.log("MASTODON_INSTANCE", MASTODON_INSTANCE);
    console.log("CLIENT_ID", CLIENT_ID);
    console.log("REDIRECT_URI", REDIRECT_URI);
    console.log("SCOPE", SCOPE);
  
    if (!CLIENT_ID) {
      return NextResponse.json({ status: "error", message: "Missing MASTODON_CLIENT_ID" }, { status: 500 });
    }

    const authUrl = `${MASTODON_INSTANCE}/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPE)}&response_type=code`;
  
    return NextResponse.redirect(authUrl);
  }
  