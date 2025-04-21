import { NextResponse } from "next/server";

const url_api = process.env.SPOTIFY_API_URL;
const url_base = process.env.SPOTIFY_BASE_URL;

export async function POST(req) {
    try{
        const {search} = await req.json();
        console.log("search: ",search);
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
        const result = await fetch(`${url_base}/v1/search?q=${encodeURIComponent(search)}&type=playlist`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`
            }
        });
        
        const data = await result.json();
        
        let test;
        //If the first element is null, find a non-null element to assign a value to.
        for(let i=0; i<data.playlists.items.length; i++){
            if(data.playlists.items[i] !== null){
                test = data.playlists.items[i].href;
                break;
            }
        };
        const id_playlist = test.replace(`${url_base}/v1/playlists/`,"");
        
        //Get each play
        const resultPlay = await fetch(`${url_base}/v1/playlists/${id_playlist}/tracks?limit=1`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`
            }
        });
        
        const dataPlay = await resultPlay.json();

        return NextResponse.json({ status: "success", message: "Get success", data: dataPlay.items[0].track.href}, { status: 200 });
    }catch(error){
        console.log(error);
        return NextResponse.json({ status: "error", message: "Mising wrong", error}, { status: 500 });
    }
}