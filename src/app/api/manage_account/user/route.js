import mysql from "mysql2/promise";
import fs from "fs";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

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

const secretKey = new TextEncoder().encode("your-secret-key");


export async function GET(req) {
    try {
        const authHeader = req.headers.get("authorization"); 
        const token = authHeader?.split(" ")[1];
        const searchParams = new URL(req.url).searchParams;
        const searchQuery = searchParams.get("searchQuery") || "";
        console.log("searchQueryUser: ",searchQuery);

        console.log("Token: ",token);
        console.log("SecretKey: ",secretKey);
        if (!token) {
            return NextResponse.json({ status: "error", message: "Missing token", error }, { status: 401 });
        }

        try {
            const { payload } = await jwtVerify(token, secretKey);

            if (payload.role === 1) {
                const connection = await mysql.createConnection(dbConfig);
                const [rows] = await connection.execute("SELECT ac.*, count(*) as count_post FROM account ac LEFT JOIN post ps ON ac.id = ps.user_id WHERE role <> 1 AND name LIKE ? GROUP BY ac.id;", [`%${searchQuery}%`]);
                await connection.end();

                return NextResponse.json({ status: "success", message: "Get list user successfully", users: rows }, { status: 200 });
            } else {
                return NextResponse.json({ status: "error", message: "Forbidden", error }, { status: 403 });
            }
        } catch (error) {
            console.error("JWT Verification Error: ", error);
            return NextResponse.json({ status: "error", message: "Invalid token", error }, { status: 401 });
        }
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ status: "error", message: "Database connection failed", error }, { status: 500 });
    }
}
