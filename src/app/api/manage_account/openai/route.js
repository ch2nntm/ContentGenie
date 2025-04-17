import { NextResponse } from "next/server";
import OpenAI from "openai";
import mysql from "mysql2/promise";
import fs from "fs";

const dbConfig = {
    host: "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
    port: 4000,
    user: "23RJwZS9wrfiKxq.root",
    password: "SxywZGpysG9CqoUA",
    database: "testdbnextjs",
    ssl: {
        ca: fs.readFileSync("/etc/ssl/cert.pem"),
    },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
    try {
        const body = await req.json();
        const apiKeyYoutube = process.env.API_KEY_YOUTUBE;

        console.log("body.user_Id: ",body.user_Id);

        const authHeader = req.headers.get("authorization"); 
        const token = authHeader?.split(" ")[1];

        if (!token) {
            return NextResponse.json({ status: "error", message: "No tokens", error }, { status: 401 });
        }
    
        const chat = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: body.messages,
        });

        const connection = await mysql.createConnection(dbConfig);
        const resultUser = await connection.execute(
          "SELECT credits, expiration_date FROM account WHERE id = ?",
          [body.user_Id]
        );

        if(resultUser.length===0){
          return NextResponse.json({ status: "error", message: "Missing user", error }, { status: 400 });
        }

        if((resultUser[0][0].credits===0 && !resultUser[0][0].expiration_date) || (resultUser[0][0].credits===0 && resultUser[0][0].expiration_date < Date.now())){
          return NextResponse.json({ status: "error", message: "Missing empty credits", error }, { status: 402 });
        }
        else {
          if((!resultUser[0][0].expiration_date && resultUser[0][0].credits>0) || (resultUser[0][0].expiration_date < Date.now() && resultUser[0][0].credits>0)){
            await connection.execute(
              "UPDATE account set credits = ? WHERE id = ?",
              [resultUser[0][0].credits-1, body.user_Id]
            );
          }

          const formattedDate = new Date().toISOString().slice(0, 10);
  
          const [testCredits] = await connection.execute(
            "SELECT * FROM credits WHERE user_id = ? AND date = ?", [body.user_Id, formattedDate]
          );
  
          if(testCredits.length === 0){
            await connection.execute(
              "INSERT INTO credits values (?, ?, 1)", [body.user_Id, formattedDate]
            )
          }
          else{
            await connection.execute(
              "UPDATE credits SET credit_use = ? WHERE user_Id = ? AND date = ?", [testCredits[0].credit_use+1, body.user_Id,formattedDate]
            )
          }
          await connection.end();
        }
      
        if(/Truyện/i.test(body.messages[body.messages.length-2].content))
          return NextResponse.json({ statuse: "success", messages: "Generate content success", chat: chat.choices[0].message}, { status: 200 });
        
        else if (/Âm nhạc/i.test(body.messages[body.messages.length-2].content)){
          const query = body.messages[body.messages.length-1].content;
          const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${apiKeyYoutube}`;
          
          const response = await fetch(url);
          const data = await response.json();
          const videoId = data.items[0]?.id?.videoId;
          return NextResponse.json({ status: "success", message: "Generate content success", music: videoId, chat: chat.choices[0].message}, { status: 200 });
        }
          
        else{
          const completion = await openai.images.generate({
            model: "dall-e-2",
            prompt: body.messages[body.messages.length-1].content, 
            n: 1,
            size: "1024x1024",
          });
          return NextResponse.json({ status: "success", message: "Generate content success", imageUrl: completion.data[0].url, chat: chat.choices[0].message}, { status: 200 });
        }
      } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ status: "error", message: "Internal server error", error}, { status: 500 });
      }
  }