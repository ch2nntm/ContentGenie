import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import fs from "fs";
import mysql from "mysql2/promise";

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

const secretKey = new TextEncoder().encode("your-secret-key");

export async function GET(req) {
    const authHeader = req.headers.get("authorization"); 
    const token = authHeader?.split(" ")[1];

    if (!token) {
        return NextResponse.json({ message: "No token provided" }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, secretKey); 
        const userId = decoded.id;

        console.log("ID: ",userId);

        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            "SELECT CAST(id AS CHAR) AS id, title, content, image, platform, posttime, status, user_id, audience FROM post WHERE user_id = ?", 
            [userId]
        );

        await connection.end(); 

        return NextResponse.json({ message: "Get list post of user successfully", posts: rows}, { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ message: "Invalid token or server error" }, { status: 401 });
    }
}
