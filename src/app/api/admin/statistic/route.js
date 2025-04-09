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

                const [rows] = await connection.execute(`
                    WITH months AS (
                        SELECT 1 AS month UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
                        SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL
                        SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL
                        SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
                    )
                    SELECT 
                        m.month, 
                        COALESCE(COUNT(DISTINCT CASE WHEN p.status = 0 THEN p.id END), 0) AS total_posts_paiding,
                        COALESCE(COUNT(DISTINCT CASE WHEN p.status = 1 THEN p.id END), 0) AS total_posts_posted,
                        COALESCE(SUM(DISTINCT c.credit_use), 0) AS total_credits
                    FROM months m
                    LEFT JOIN post p ON MONTH(p.posttime) = m.month AND YEAR(p.posttime) = ?
                    LEFT JOIN credits c ON MONTH(c.date) = m.month AND YEAR(c.date) = ?
                    GROUP BY m.month
                    ORDER BY m.month;
                `, [year, year]);

                const postsYear = rows;

                const [rows_checkYear] = await connection.execute(`
                    SELECT * FROM dashboard WHERE year = ?
                    `,[year]);

                if(rows_checkYear.length === 0){
                    for (const item of postsYear) {
                        if(item.total_credits!=0 || item.total_posts_paiding!=0 || item.total_posts_posted!=0){
                            await connection.execute(`INSERT INTO dashboard(year, month, total_credits, total_posts_paiding, total_posts_posted) VALUE(?,?,?,?,?)`,
                            [year, item.month, item.total_credits, item.total_posts_paiding, item.total_posts_posted])
                            console.log("Add success");
                        }
                    }
                }
                else{
                    for (const item of postsYear) {
                        const [rows_checkMonth] = await connection.execute(`
                            SELECT * FROM dashboard WHERE month = ? AND year = ?
                            `,[item.month, year]);
                        if(rows_checkMonth.length === 0){
                            if(item.total_credits!=0 || item.total_posts_paiding!=0 || item.total_posts_posted!=0){
                                await connection.execute(`INSERT INTO dashboard(year, month, total_credits, total_posts_paiding, total_posts_posted) VALUE(?,?,?,?,?)`,
                                [year, item.month, item.total_credits, item.total_posts_paiding, item.total_posts_posted]);
                                console.log("Add success");
                            }
                        }
                        else{
                            if(item.total_credits==0 && item.total_posts_paiding==0 && item.total_posts_posted==0){
                                await connection.execute(`DELETE FROM dashboard WHERE id=?`,[rows_checkMonth[0].id]);
                                console.log("DELETE success");
                            }
                            else{
                                await connection.execute(`UPDATE dashboard SET total_credits=?, total_posts_paiding=?, total_posts_posted=? WHERE id=?`,
                                    [item.total_credits, item.total_posts_paiding, item.total_posts_posted, rows_checkMonth[0].id]
                                )
                                console.log("UPDATE success");
                            }
                        }
                    }
                }
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

export async function GET(req) {
    try{
        const authHeader = req.headers.get("authorization"); 
        const token = authHeader?.split(" ")[1];

        if (!token) {
            return new Response(JSON.stringify({ message: "Missing token" }), { status: 401 });
        }

        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`SELECT * FROM dashboard`);
        await connection.end();
        console.log("LIST POST: ",rows);
        return NextResponse.json({rows},{status:200})
    }catch(error){
        console.log(error);
        return NextResponse.json({error});
    }
}