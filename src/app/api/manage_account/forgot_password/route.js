import fs from "fs";
import mysql from "mysql2/promise";
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

export async function POST(req) {
    try{
        const {username} = await req.json();
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            "SELECT * FROM account WHERE username = ?",
            [username]
        );
      
        if (rows.length > 0) {
            return NextResponse.json({ message: "Username is correct!" }, { status: 200 });
        } else {
            return new Response(
                JSON.stringify({ error: "Wrong username!" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ error: "Database connection error!" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

export async function PUT(req) {
    try {
        const { password, username } = await req.json();

        if (!password) {
            return NextResponse.json({ error: "Thiếu password" }, { status: 400 });
        }

        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            "UPDATE account SET password = ? WHERE username = ?",
            [password, username]
        );

        await connection.end();

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Sai tên đăng nhập hoặc không tìm thấy tài khoản" }, { status: 400 });
        }

        return NextResponse.json({ message: "Cập nhật mật khẩu thành công"}, { status: 200 });

    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ error: "Database connection error!" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
