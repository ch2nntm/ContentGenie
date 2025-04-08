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
        const {email} = await req.json();
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            "SELECT * FROM account WHERE email = ?",
            [email]
        );
      
        if (rows.length > 0) {
            return NextResponse.json({ message: "Email is correct!" }, { status: 200 });
        } else {
            return new Response(
                JSON.stringify({ error: "Wrong email!" }),
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
        const { password, email } = await req.json();

        if (!password) {
            return NextResponse.json({ error: "Thiếu password" }, { status: 400 });
        }

        const connection = await mysql.createConnection(dbConfig);

        const [resultExist] = await connection.execute(
            "SELECT password FROM account WHERE email = ?",
            [email]
        )
        console.log("resultExist:",resultExist);

        if(resultExist.affectedRows !== 0 && resultExist[0].password === password){
            console.log("resultExist:",resultExist);
            return NextResponse.json({ error: "Mat khau cu trung voi mat khau moi", status: 202 }, { status: 202 });;
        }

        const [result] = await connection.execute(
            "UPDATE account SET password = ? WHERE email = ?",
            [password, email]
        );

        await connection.end();

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Sai email hoặc không tìm thấy tài khoản" }, { status: 400 });
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
