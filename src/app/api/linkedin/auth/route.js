import { NextResponse } from "next/server";

export async function GET() {
    const LINKEDIN_INSTANCE = process.env.LINKEDIN_INSTANCE;
    const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
    const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;
    const SCOPE = process.env.LINKEDIN_SCOPE;
  
    if (!CLIENT_ID) {
      return NextResponse.json({ status: "error", message: "Missing MASTODON_CLIENT_ID" }, { status: 500 });
    }
  
    const authUrl = `${LINKEDIN_INSTANCE}/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPE)}`;
  
    return NextResponse.redirect(authUrl);
  }
  