import mysql from "mysql2/promise";
import fs from "fs";

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
      return NextResponse.json({ message: "No tokens" }, { status: 401 });
  }
  
  try {
    const { id, keyword, content, imgUrl, posttime, user_id, platform, status, audience } = await req.json();

    const safeTitle = keyword || "Untitled"; 
    const safeStatus = status === true || status === "true";
    const safeImage = imgUrl || null; 

    const connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      "INSERT INTO post (id, title, content, image, posttime, user_id, platform, status, audience) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, safeTitle, content, safeImage, posttime, user_id, platform, safeStatus, audience]
    );

    await connection.end(); 

    return new Response(
      JSON.stringify({ message: "Post created successfully" }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Database error:", error);
    return new Response(
      JSON.stringify({ error: "Database connection failed" }),
      { status: 500 }
    );
  }
}
