import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
    try {
        const body = await req.json();
        const apiKeyYoutube = process.env.API_KEY_YOUTUBE;

        const authHeader = req.headers.get("authorization"); 
        const token = authHeader?.split(" ")[1];

        if (!token) {
            return NextResponse.json({ message: "No tokens" }, { status: 401 });
        }
    
        const chat = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: body.messages,
        });
        

        if(/Truyện/i.test(body.messages[body.messages.length-2].content))
          return NextResponse.json({messages:  chat.choices[0].message}, { status: 200 });
        
        else if (/Âm nhạc/i.test(body.messages[body.messages.length-2].content)){
          const query = body.messages[body.messages.length-1].content;
          const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${apiKeyYoutube}`;
          
          const response = await fetch(url);
          const data = await response.json();
          const videoId = data.items[0]?.id?.videoId;
          return NextResponse.json({music: videoId, messages:  chat.choices[0].message}, { status: 200 });
        }
          
        else{
          const completion = await openai.images.generate({
            model: "dall-e-2",
            prompt: body.messages[body.messages.length-1].content, 
            n: 1,
            size: "1024x1024",
          });
          return NextResponse.json({imageUrl: completion.data[0].url, messages:  chat.choices[0].message}, { status: 200 });
        }
      } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
      }
  }