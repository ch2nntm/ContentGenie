import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

// export async function POST() {
//   const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
//   const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
//   const REDIRECT_URI="https://dev.example.com/auth/linkedin/callback";
//   const code = "AQQ-8MDJNgijrR2RIZ8sN8_FVNQPc54yEDhPgktLNZTys9-LP460sGNzqMkmrqr-MsvRe002u3tVvzNR-BTkm0fwLVIuPOGwYUi85sm5xwCNOByrddJ-uyb1mfRg_Ml6q9I3wx1cdAfdidAYHrEg5A3tAiHOTXv5Fcas4rE2EzogNREjVL_q718Mmo0LrFfhETi5AWXPqf-EHcDZNug";

//   if (!code) {
//     return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
//   }

//   try {
//     const formData = new URLSearchParams();
//     formData.append("grant_type", "authorization_code");
//     formData.append("code", code);
//     formData.append("redirect_uri", REDIRECT_URI);
//     formData.append("client_id", CLIENT_ID);
//     formData.append("client_secret", CLIENT_SECRET);

//     const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
//       method: "POST",
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       body: formData,
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("LinkedIn API Error:", errorText);
//       return NextResponse.json({ error: "LinkedIn API Error", details: errorText }, { status: response.status });
//     }

//     const data = await response.json();
//     return NextResponse.json(data, { status: 200 });
//   } catch (error) {
//     console.error("LinkedIn Token Error:", error);
//     return NextResponse.json({ error: "Failed to fetch access token" }, { status: 500 });
//   }
// }


export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization"); 
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ status: "error", message: "Missing ID Token" }, { status: 401 });
    }

    const decoded = jwt.decode(token);
    console.log("Decoded Token:", decoded);

    return NextResponse.json({ status: "success", message: "Get info linkedin success", data: decoded}, { status: 200 });
  } catch (error) {
    console.error("Token Decode Error:", error);
    return NextResponse.json({ status: "error", message: error }, { status: 500 });
  }
}


