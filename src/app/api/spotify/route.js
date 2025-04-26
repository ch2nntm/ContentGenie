import { NextResponse } from "next/server";

const url_api = process.env.SPOTIFY_API_URL;
// const url_base = process.env.SPOTIFY_BASE_URL;

export async function POST(req) {
    try{
        const {id} = await req.json();
        console.log("id: ",id);
        const tokenResponse = await fetch(url_api, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(
                    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                ).toString("base64")}`,
            },
            body: new URLSearchParams({
                grant_type: "client_credentials",
            }),
        });

        if (!tokenResponse.ok) {
            throw new Error("Failed to fetch access token");
        }

        const tokenData = await tokenResponse.json();
        console.log("tokenData.data.access_token: ",tokenData.access_token);

        //Get playlist
        const result = await fetch(`${process.env.SPOTIFY_BASE_URL}/v1/artists/${id}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`
            }
        });
        
        const data = await result.json();

        return NextResponse.json({ status: "success", message: "Get success", data: data}, { status: 200 });
    }catch(error){
        console.log(error);
        return NextResponse.json({ status: "error", message: "Mising wrong", error}, { status: 500 });
    }
}