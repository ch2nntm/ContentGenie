import { NextResponse } from "next/server";
import OpenAI from "openai";
import mysql from "mysql2/promise";
import { cookies } from "next/headers";
import dbConfig from "../../../../../dbConfig.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const url_api = process.env.SPOTIFY_API_URL;
const url_base = process.env.SPOTIFY_BASE_URL;
const apiKeyYoutube = process.env.API_KEY_YOUTUBE;

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const body = await req.json();

        console.log("body.user_Id: ",body.user_Id);

        const authHeader = req.headers.get("authorization"); 
        const token = authHeader?.split(" ")[1];

        if (!token) {
            return NextResponse.json({ status: "error", message: "No tokens" }, { status: 401 });
        }

        const listmessages = await fetchRecentConversation(body.messages[body.messages.length-1].content, body.topicName);
        console.log("listmessages: ",listmessages);
        console.log("body.messages: ",body.messages);
        console.log("body.topic: ",body.topicName);
    
        const chat = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: listmessages,
        });

        const connection = await mysql.createConnection(dbConfig);
        console.log("chat.choices[0].message: ",chat.choices[0].message);

        await connection.execute(
          "INSERT INTO conversation_history (user_id, topic_name, role, message) VALUES (?, ?, ?, ?)",
          [body.user_Id, body.topicName, "user", chat.choices[0].message.content]
        );

        const resultUser = await connection.execute(
          "SELECT credits, expiration_date FROM account WHERE id = ?",
          [body.user_Id]
        );

        if(resultUser.length===0){
          return NextResponse.json({ status: "error", message: "Missing user" }, { status: 400 });
        }

        if((resultUser[0][0].credits===0 && !resultUser[0][0].expiration_date) || (resultUser[0][0].credits===0 && resultUser[0][0].expiration_date < Date.now())){
          return NextResponse.json({ status: "error", message: "Missing empty credits" }, { status: 402 });
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
              "INSERT INTO credits(user_id, date, credit_use) values (?, ?, 1)", [body.user_Id, formattedDate]
            )
          }
          else{
            await connection.execute(
              "UPDATE credits SET credit_use = ? WHERE user_Id = ? AND date = ?", [testCredits[0].credit_use+1, body.user_Id,formattedDate]
            )
          }
          await connection.end();
        }
        
        if(body.topicName==="Tale")
          return NextResponse.json({ statuse: "success", messages: "Generate content success", chat: chat.choices[0].message}, { status: 200 });
        
        else if (body.topicName==="Youtube"){
          const query = body.messages[body.messages.length-1].content;
          const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${apiKeyYoutube}`;
          
          const response = await fetch(url);
          const data = await response.json();
          const videoId = data.items[0]?.id?.videoId;
          console.log("videoId: ",videoId);
          return NextResponse.json({ status: "success", message: "Generate content success", music: videoId, chat: chat.choices[0].message}, { status: 200 });
        }
        else if (body.topicName==="Image"){
          const completion = await openai.images.generate({
            model: "dall-e-2",
            prompt: body.messages[body.messages.length-1].content, 
            n: 1,
            size: "1024x1024",
          });
          return NextResponse.json({ status: "success", message: "Generate content success", imageUrl: completion.data[0].url, chat: chat.choices[0].message}, { status: 200 });
        }
        else{
          const query = body.messages[body.messages.length-1].content;
          const tokenResponse = await fetch(url_api, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(
                    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                ).toString("base64")}`,
            },
            body: new URLSearchParams({
                grant_type: "client_credentials", // No personal accounts allowed
            }),
          });

          if (!tokenResponse.ok) {
              throw new Error("Failed to fetch access token");
          }

          const tokenData = await tokenResponse.json();
          cookieStore.set("token_spotify", tokenData.access_token, {path: "/", sameSite: "Lax"})

          //Get playlist
          const result = await fetch(`${url_base}/v1/search?q=${encodeURIComponent(query)}&type=playlist`, {
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

          return NextResponse.json({ status: "success", message: "Get success", spotify: dataPlay.items[0].track.href, chat: chat.choices[0].message}, { status: 200 });
        }
      } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ status: "error", message: error}, { status: 500 });
      }
  }

const fetchRecentConversation = async (content, topicName) => {
  const connection = await mysql.createConnection(dbConfig);
  const history = await connection.query(
      'SELECT role, message FROM conversation_history WHERE topic_name = ? AND role = "system"', 
      [topicName]
  );

  const messages = [];
  messages.push({
    role: "user",
    content: content
  });

  console.log("topicName: ",topicName);
  
  history[0].forEach(record => {
    if (record.role && record.message) {
      messages.push({
        role: record.role,
        content: record.message
      });
    }
  });

  console.log("history: ",history);

  await connection.end();

  return messages.reverse();
};
