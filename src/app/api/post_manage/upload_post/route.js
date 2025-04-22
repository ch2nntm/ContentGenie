import mysql from "mysql2/promise";
import fs from "fs";
import { NextResponse } from "next/server";

const dbConfig = {
    host: "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
    port: 4000,
    user: "23RJwZS9wrfiKxq.root",
    password: "SxywZGpysG9CqoUA",
    database: "testdbnextjs",
    ssl: {
        ca: fs.readFileSync("/etc/ssl/cert.pem"), // Đọc file chứng chỉ CA
    },
  };

export async function POST(req) {
  const authHeader = req.headers.get("authorization"); 
  const token = authHeader?.split(" ")[1];

  if (!token) {
      return NextResponse.json({ status: "error", message: "No tokens", error }, { status: 401 });
  }
  
  try {
    let { id, keyword, content, imgUrl, posttime, user_id, platform, status, audience, set_daily,  nameSpotify, nameArtist, resultImage } = await req.json();

    console.log("Posttime:", posttime.toLocaleString("en-CA", { 
      timeZone: "Asia/Ho_Chi_Minh", 
      hour12: false 
    }).replace(",", ""));

    if(nameSpotify && nameArtist && resultImage){
      imgUrl = imgUrl+","+nameSpotify+","+nameArtist+","+resultImage;
    }

    const statusSetDaily = set_daily ? 1 : 0;
    const safeTitle = keyword || "Untitled"; 
    const safeStatus = status === true || status === "true";
    const safeImage = imgUrl || null; 

    const connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      "INSERT INTO post (id, title, content, image, posttime, user_id, platform, status, audience, set_daily) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, safeTitle, content, safeImage, posttime, user_id, platform, safeStatus, audience, statusSetDaily]
    );

    await connection.end(); 

    return NextResponse.json({ status: "success", message: "Post created successfully" }, { status: 200 });

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ status: "error", message: "Database connection failed", error }, { status: 500 });
  }
}
