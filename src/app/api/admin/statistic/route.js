import mysql from "mysql2/promise";
import { NextResponse } from "next/server";
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

export async function POST(req) {
    try{
        const authHeader = req.headers.get("authorization"); 
        const token = authHeader?.split(" ")[1];
        const {year} = await req.json();

        if (!token) {
            return new Response(JSON.stringify({ message: "Missing token" }), { status: 401 });
        }

        try {
            const { payload } = await jwtVerify(token, secretKey);

            if (payload.role === 1) {
                const connection = await mysql.createConnection(dbConfig);
                    
                // const [rows] = await connection.execute("SELECT MONTH(p.posttime) AS month, COUNT(DISTINCT p.id) AS total_posts, SUM(DISTINCT c.credit_use) AS total_credits FROM post p LEFT JOIN credits c ON MONTH(p.posttime) = MONTH(c.date) WHERE YEAR(p.posttime) = ? AND MONTH(p.posttime) = ? GROUP BY MONTH(p.posttime);", [year, 3]);
                const [rows] = await connection.execute(`
                    WITH months AS (
                        SELECT 1 AS month UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
                        SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL
                        SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL
                        SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
                    )
                    SELECT 
                        m.month, 
                        COALESCE(COUNT(DISTINCT p.id), 0) AS total_posts,
                        COALESCE(SUM(DISTINCT c.credit_use), 0) AS total_credits
                    FROM months m
                    LEFT JOIN post p ON MONTH(p.posttime) = m.month AND YEAR(p.posttime) = ?
                    LEFT JOIN credits c ON MONTH(c.date) = m.month AND YEAR(c.date) = ?
                    GROUP BY m.month
                    ORDER BY m.month;
                `, [year, year]);
                
                console.log(rows);

                await connection.end();

                return new Response(
                    JSON.stringify({posts: rows }),
                    { status: 200, headers: { "Content-Type": "application/json" } }
                );
            } else {
                return new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 });
            }
        } catch (error) {
            console.error("JWT Verification Error: ", error);
            return new Response(JSON.stringify({ message: "Invalid token" }), { status: 401 });
        }
    }catch(error){
        return NextResponse.json({error},{status:500});
    }
}