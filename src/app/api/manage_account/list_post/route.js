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
        console.log("searchQueryPost: ",searchQuery);

        if (!token) {
            return NextResponse.json({ status: "error", message: "Missing token", error }, { status: 401 });
        }

        try {
            const { payload } = await jwtVerify(token, secretKey);

            if (payload.role === 1) {
                const connection = await mysql.createConnection(dbConfig);
                const [rows] = await connection.execute("SELECT CAST(post.id AS CHAR) as post_id, post.title, post.content, post.image, post.posttime, post.audience, account.name, account.avatar, post.platform FROM post left join account on post.user_id = account.id WHERE post.content LIKE ? OR post.title LIKE ? OR account.name LIKE ?", [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`]);
                await connection.end();

                return NextResponse.json({ status: "success", message: "Get list post successfully", posts: rows }, { status: 200 });
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

export async function POST(req) {
    try {
        const {year, month, week} = await req.json();
        console.log("Year: ",year," - month: ",month," - week: ",week);
        if(!year || !month || !week)
            return NextResponse.json({ status: "error", message: "Missing the field", error}, { status: 400 });
        const authHeader = req.headers.get("authorization"); 
        const token = authHeader?.split(" ")[1];

        if (!token) {
            return NextResponse.json({ status: "error", message: "Missing token", error }, { status: 401 });
        }

        try {
            const { payload } = await jwtVerify(token, secretKey);

            if (payload.role === 1) {
                const connection = await mysql.createConnection(dbConfig);
                const [rows] = await connection.execute("SELECT CAST(post.id AS CHAR) as post_id, post.title, post.content, post.image, post.posttime, post.audience, account.name, account.avatar, post.platform "
                    + "FROM post left join account on post.user_id = account.id "
                    + "WHERE YEAR(post.posttime) = ? AND MONTH(post.posttime) = ? AND FLOOR((DAY(post.posttime) - 1) / 7) + 1 = ?",
                [year, month, week]);
                
                    await connection.end();

                return NextResponse.json({ status: "success", message: "Get list post successfully", posts: rows }, { status: 200 });
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
