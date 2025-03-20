import { NextResponse } from 'next/server';

const CLIENT_ID = "8660xy4jt5qye8";
const REDIRECT_URI = "https://dev.example.com/auth/linkedin/callback"; // Callback trong BE

export async function GET() {
    const linkedInAuthURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=foobar&scope=openid%20profile%20email%20w_member_social`;
    return NextResponse.json({ url: linkedInAuthURL }, { status: 200 });
}
