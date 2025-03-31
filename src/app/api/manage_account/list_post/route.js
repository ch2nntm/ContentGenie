import mysql from "mysql2/promise";
import fs from "fs";
import { jwtVerify } from "jose";

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

        if (!token) {
            return new Response(JSON.stringify({ message: "Missing token" }), { status: 401 });
        }

        try {
            const { payload } = await jwtVerify(token, secretKey);

            if (payload.role === 1) {
                const connection = await mysql.createConnection(dbConfig);
                const [rows] = await connection.execute("SELECT CAST(post.id AS CHAR) as post_id, post.title, post.content, post.image, post.audience, account.name, account.avatar, post.platform FROM post left join account on post.user_id = account.id");
                await connection.end();

                return new Response(
                    JSON.stringify({ message: "Get list post successfully", posts: rows }),
                    { status: 200, headers: { "Content-Type": "application/json" } }
                );
            } else {
                return new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 });
            }
        } catch (error) {
            console.error("JWT Verification Error: ", error);
            return new Response(JSON.stringify({ message: "Invalid token" }), { status: 401 });
        }
    } catch (error) {
        console.error("Database error:", error);
        return new Response(
            JSON.stringify({ error: "Database connection failed" }),
            { status: 500 }
        );
    }
}
