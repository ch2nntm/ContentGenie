import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
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

export async function PUT(req) {
    const authHeader = req.headers.get("authorization"); 
    const token = authHeader?.split(" ")[1];

    if (!token) {
        return NextResponse.json({ message: "No tokens" }, { status: 401 });
    }

    try {
        const { content, image, id } = await req.json();
        const connection = await mysql.createConnection(dbConfig);
        if (!content) {
            return NextResponse.json({ error: "Thiếu dữ liệu đầu vào" }, { status: 400 });
        }
        const [result] = await connection.execute(
            "UPDATE post SET content = ?, image = ? WHERE id = ?",
            [content, image, id]
        );

        if (result.affectedRows === 0) {
            await connection.end();
            return NextResponse.json({ error: "Không thể cập nhật thông tin" }, { status: 400 });
        }

        return NextResponse.json({
            message: "Cập nhật bài đăng thành công",
        }, { status: 200 });

    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
    }
}