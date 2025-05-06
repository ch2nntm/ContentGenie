import mysql from "mysql2/promise";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import dbConfig from "../../../../../dbConfig.js";

const secretKey = new TextEncoder().encode("your-secret-key");

export async function POST(req) {
    try{
        const authHeader = req.headers.get("authorization"); 
        const token = authHeader?.split(" ")[1];
        const {year} = await req.json();

        if (!token) {
            return NextResponse.json({ status: "error", message: "Missing token" }, { status: 401 });
        }

        if(!year){
            return NextResponse.json({ status: "error", message: "Missing year" }, { status: 400 });
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
                        COALESCE(
                            (SELECT SUM(c.credit_use) 
                            FROM credits c 
                            WHERE c.id IN (SELECT DISTINCT c2.id FROM credits c2 WHERE MONTH(c2.date) = m.month AND YEAR(c2.date) = ?)
                            ), 0) AS total_credits
                    FROM months m
                    LEFT JOIN post p 
                        ON MONTH(p.posttime) = m.month AND YEAR(p.posttime) = ?
                    GROUP BY m.month
                    ORDER BY m.month;
                `, [year, year]);

                const postsYear = rows;

                //Filter all information in the Dashboard by year
                const [rows_checkYear] = await connection.execute(`
                    SELECT * FROM dashboard WHERE year = ?
                    `,[year]);

                //If there are no records yet
                if(rows_checkYear.length === 0){
                    // Filter results for 12 months. If any month has data, add it to the database.
                    for (const item of postsYear) {
                        if(item.total_credits!=0 || item.total_posts_paiding!=0 || item.total_posts_posted!=0){
                            await connection.execute(`INSERT INTO dashboard(year, month, total_credits, total_posts_paiding, total_posts_posted) VALUE(?,?,?,?,?)`,
                            [year, item.month, item.total_credits, item.total_posts_paiding, item.total_posts_posted])
                            console.log("Add success");
                        }
                    }
                }
                // If the record exists
                else{
                    // Filter results for 12 months.
                    for (const item of postsYear) {
                        //Filter all information in the Dashboard by year and by month
                        const [rows_checkMonth] = await connection.execute(`
                            SELECT * FROM dashboard WHERE month = ? AND year = ?
                            `,[item.month, year]);
                        //If there are no records yet
                        if(rows_checkMonth.length === 0){
                            //  If this month has data, add it to the database.
                            if(item.total_credits!=0 || item.total_posts_paiding!=0 || item.total_posts_posted!=0){
                                await connection.execute(`INSERT INTO dashboard(year, month, total_credits, total_posts_paiding, total_posts_posted) VALUE(?,?,?,?,?)`,
                                [year, item.month, item.total_credits, item.total_posts_paiding, item.total_posts_posted]);
                                console.log("Add success");
                            }
                        }
                        // If the record exists
                        else{
                            // If the filtered data of that month is 0, delete it from the database.
                            if(item.total_credits==0 && item.total_posts_paiding==0 && item.total_posts_posted==0){
                                await connection.execute(`DELETE FROM dashboard WHERE id=?`,[rows_checkMonth[0].id]);
                                console.log("DELETE success");
                            }
                            // Update new data into database
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

                return NextResponse.json({ status: "success", message: "Get statistic success", posts: rows }, {status: 200 });

            } else {
                return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });
            }
        } catch (error) {
            console.error("JWT Verification Error: ", error);
            return NextResponse.json({ status: "error", message: error }, { status: 401 });
        }
    }catch(error){
        return NextResponse.json({ status: "error", message: error }, { status: 500 });
    }
}

export async function GET(req) {
    try{
        const authHeader = req.headers.get("authorization"); 
        const token = authHeader?.split(" ")[1];

        if (!token) {
            return NextResponse.json({ status: "error", message: "Missing token" }, { status: 401 });
        }

        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`SELECT * FROM dashboard`);
        await connection.end();
        console.log("LIST POST: ",rows);
        return NextResponse.json({ status: "success", message: "Get dashboard success", data: rows }, { status: 200 });
    }catch(error){
        console.log(error);
        return NextResponse.json({ status: "error", message: error });
    }
}


