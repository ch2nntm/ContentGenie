import { NextResponse } from "next/server";

export async function POST(req) {
    const apiKey = "AIzaSyAdtRRz805rCqNYsxTahilGU75dayjl5CA";
    
    try {
      const body = await req.json();
      const query = body.messages[body.messages.length-1].content;
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      const videoId = data.items[0]?.id?.videoId;
      
      console.log("Bai hat: ",videoId);
      return NextResponse.json({ music: videoId }, { status: 200 });
    }catch (error) {
      console.error("Error:", error);
      return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
  }