import mysql from "mysql2/promise";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import fs from "fs";

const dbConfig = {
    host: "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
    port: 4000,
    user: "23RJwZS9wrfiKxq.root",
    password: "SxywZGpysG9CqoUA",
    database: "testdbnextjs",
    ssl: {
        ca: fs.readFileSync("/etc/ssl/cert.pem"), // Đọc file chứng chỉ CA
    },
  };

const secretKey = new TextEncoder().encode("your-secret-key");

async function generateToken(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h") // Token hết hạn sau 1 giờ
        .sign(secretKey);
}

  export async function PUT(req) {
    try {
        const { userName, password, newPassword } = await req.json();

        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            "UPDATE account SET password = ? WHERE username = ? AND password = ?",
            [newPassword, userName, password]
        );

        if (result.affectedRows === 0) {
            await connection.end();
            return NextResponse.json({ error: "Sai tên đăng nhập hoặc mật khẩu" }, { status: 400 });
        }

        const [updatedUser] = await connection.execute(
            "SELECT * FROM account WHERE username = ? AND password = ?",
            [userName, newPassword]
        );
        await connection.end();

        if (updatedUser.length === 0) {
            return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });
        }

        const user = updatedUser[0];

        // Tạo token mới
        const newToken = await generateToken(user);

        return NextResponse.json({
            message: "Mật khẩu đã được thay đổi thành công",
            accessToken: newToken, // Trả về token mới
            user, // Trả về thông tin user mới
        }, { status: 200 });

    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
    }
}
