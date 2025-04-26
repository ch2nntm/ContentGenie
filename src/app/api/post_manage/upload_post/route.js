import mysql from "mysql2/promise";
import { NextResponse } from "next/server";
import dbConfig from "../../../../../dbConfig.js";

export async function POST(req) {
  const authHeader = req.headers.get("authorization"); 
  const token = authHeader?.split(" ")[1];

  if (!token) {
      return NextResponse.json({ status: "error", message: "No tokens" }, { status: 401 });
  }
  
  try {
    let { id, keyword, content, imgUrl, posttime, user_id, platform, status, audience, set_daily,  nameSpotify, nameArtist, resultImage } = await req.json();

    console.log("Posttime:", posttime.toLocaleString("en-CA", { 
      timeZone: "Asia/Ho_Chi_Minh", 
      hour12: false 
    }).replace(",", ""));

    console.log("set_daily: ",set_daily);

    if(nameSpotify && nameArtist && resultImage){
      imgUrl = imgUrl+","+nameSpotify+","+nameArtist+","+resultImage;
    }

    const statusSetDaily = set_daily===true ? 1 : 0;
    const safeTitle = keyword || "Untitled"; 
    const safeStatus = status === true || status === "true";
    const safeImage = imgUrl || null; 

    console.log("statusSetDaily: ", statusSetDaily);  

    const connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      "INSERT INTO post (id, title, content, image, posttime, user_id, platform, status, audience, set_daily) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, safeTitle, content, safeImage, posttime, user_id, platform, safeStatus, audience, statusSetDaily]
    );

    await connection.end(); 

    return NextResponse.json({ status: "success", message: "Post created successfully" }, { status: 200 });

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ status: "error", message: error }, { status: 500 });
  }
}
