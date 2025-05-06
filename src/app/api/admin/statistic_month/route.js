import mysql from "mysql2/promise";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import dbConfig from "../../../../../dbConfig.js";

const secretKey = new TextEncoder().encode("your-secret-key");

export async function GET(req) {
    try {
        const authHeader = req.headers.get("authorization");
        const token = authHeader?.split(" ")[1];
        
        if (!token) {
            return NextResponse.json({ status: "error", message: "Missing token" }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, secretKey);

        if (payload.role === 1) {
            const connection = await mysql.createConnection(dbConfig);
            const [rows] = await connection.execute(`
                SELECT count(*) as Number, MONTH(posttime) as Month 
                FROM post 
                WHERE (MONTH(posttime) = MONTH(NOW()) AND YEAR(posttime) = YEAR(NOW())) 
                OR (MONTH(posttime) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH)) AND YEAR(posttime) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))) 
                GROUP BY MONTH(posttime) 
                ORDER BY MONTH(posttime)
            `);

            const currentMonth = new Date().getMonth() + 1; 
            const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
            let numberPostPreviousMonth = 0;
            let numberPostCurrentMonth = 0;
            for (const item of rows) {
                if (item.Month === previousMonth) {
                    numberPostPreviousMonth = item.Number;
                }
                if (item.Month === currentMonth) {
                    numberPostCurrentMonth = item.Number;
                }
            }
            let rate_post = null;
            if (numberPostPreviousMonth > 0) {
                rate_post = ((numberPostCurrentMonth - numberPostPreviousMonth) / numberPostPreviousMonth) * 100;
            } else if (numberPostPreviousMonth === 0 && numberPostCurrentMonth > 0) {
                rate_post = 100;
            } else {
                rate_post = 0;
            }

            const [rows_credits] = await connection.execute(`
                SELECT sum(credit_use) as Number, MONTH(date) as Month 
                FROM credits 
                WHERE (MONTH(date) = MONTH(NOW()) AND YEAR(date) = YEAR(NOW())) 
                OR (MONTH(date) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH)) AND YEAR(date) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))) 
                GROUP BY MONTH(date) 
                ORDER BY MONTH(date)
            `);
            let numberCreditPreviousMonth = 0;
            let numberCreditCurrentMonth = 0;
            for (const item of rows_credits) {
                if (item.Month === previousMonth) {
                    numberCreditPreviousMonth = item.Number;
                }
                if (item.Month === currentMonth) {
                    numberCreditCurrentMonth = item.Number;
                }
            }
            let rate_credit = null;
            if (numberCreditPreviousMonth > 0) {
                rate_credit = ((numberCreditCurrentMonth - numberCreditPreviousMonth) / numberCreditPreviousMonth) * 100;
            } else if (numberCreditPreviousMonth === 0 && numberCreditCurrentMonth > 0) {
                rate_credit = 100;
            } else {
                rate_credit = 0;
            }

            await connection.end();

            return NextResponse.json({ status: "success", message: "Get dashboard success",
                data: {
                    rate_post: rate_post.toFixed(2) + "%",
                    rate_credit: rate_credit.toFixed(2) + "%",
                }
            }, { status: 200 });
        } else {
            return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });
        }
    } catch (error) {
        return NextResponse.json({ status: "error", message: error }, { status: 500 });
    }
}