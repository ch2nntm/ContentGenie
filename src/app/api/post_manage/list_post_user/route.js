import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import dbConfig from "../../../../../dbConfig.js";

const secretKey = new TextEncoder().encode("your-secret-key");

export async function GET(req) {
    const authHeader = req.headers.get("authorization"); 
    const token = authHeader?.split(" ")[1];

    if (!token) {
        return NextResponse.json({ status: "error", message: "No token provided" }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, secretKey); 
        const userId = decoded.id;

        console.log("ID: ",userId);

        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            "SELECT CAST(id AS CHAR) AS id, title, content, image, platform, posttime, status, user_id, audience FROM post WHERE user_id = ? AND set_daily = 'false'", 
            [userId]
        );

        await connection.end(); 

        return NextResponse.json({ status: "success", message: "Get list post of user successfully", posts: rows}, { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ status: "error", message: error }, { status: 401 });
    }
}
