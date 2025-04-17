import { NextResponse } from "next/server";
import fs from "fs";
import mysql from "mysql2/promise";

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
export async function GET(req, {params}) {
    const body = await params;
    const id = body.id;
    console.log("Id:", id); 

    if (isNaN(id)) {
        return NextResponse({ status: "error", message: "Invalid user ID", error }, { status: 400 });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
    
        const [rows] = await connection.execute(
          "SELECT * FROM post WHERE user_id = ? AND set_daily = 'false'",
          [id]
        );
        await connection.end();
    
        if (rows.length === 0) {
          return NextResponse.json({ status: "error", message: "User not found", error }, { status: 404 });
        }
    
        return NextResponse.json({ status: "success", message: "Get list post of user successfully", data: rows.length}, { status: 200 });
      } catch (error) {
        console.error(error);
        return NextResponse.json({ status: "error", message: "Database connection failed", error }, { status: 500 });
      }
}
