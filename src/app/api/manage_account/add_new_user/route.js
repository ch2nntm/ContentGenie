import mysql from "mysql2/promise";
import { NextResponse } from "next/server";
import fs from "fs";

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

  export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email"); 

        if (!email) {
            return NextResponse.json({ error: "Miss email" }, { status: 400 });
        }

        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            "SELECT * FROM account WHERE email = ?",
            [email]
        );
        await connection.end();

        if (result.length > 0) {
            return NextResponse.json({ error: "Account exist" }, { status: 409 });
        }

        return NextResponse.json({ success: "Account isn't exist" }, { status: 200 });

    } catch (error) {
        console.error("Lỗi hệ thống:", error);
        return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }
}

export async function POST(req) {
    try{
        const {name, username, password, email} = await req.json();
        const connection = await mysql.createConnection(dbConfig);

        const [result1] = await connection.execute(
            "SELECT * FROM account WHERE email = ?",
            [email]
        );

        if (result1.length > 0) {
            return NextResponse.json({error: "Email exist"},{status: 400});
        }

        const [] = await connection.execute(
            "INSERT INTO account (email, name, avatar, username, password, role, credits) VALUES (?, ?, '', ?, ?, 0, 20)",
            [email,name, username, password]
        );
        await connection.end(); 

        return new Response(
            JSON.stringify({ message: "Account created successfully" }),
            { status: 201, headers: { "Content-Type": "application/json" } }
        );
    }catch (error) {
        console.error("Database error:", error);
        return new Response(
            JSON.stringify({ error: "Database connection failed" }),
            { status: 500 }
        );
    }
}