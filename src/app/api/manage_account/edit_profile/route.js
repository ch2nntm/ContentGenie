import mysql from "mysql2/promise";
import { NextResponse } from "next/server";
import fs from "fs";
import { SignJWT } from "jose";

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

async function generateToken(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h") 
        .sign(secretKey);
}

export async function PUT(req) {
    const authHeader = req.headers.get("authorization"); 
    const token = authHeader?.split(" ")[1];

    if (!token) {
        return NextResponse.json({ message: "No tokens" }, { status: 401 });
    }

    try {
        const { userName, password, inputName, avatar, email} = await req.json();
        const connection = await mysql.createConnection(dbConfig);
        console.log(userName + " - " + password + " - " + inputName);
        if (!userName || !password || !inputName) {
            console.log(userName + " - " + password + " - " + inputName);
            return NextResponse.json({ error: "Thiếu dữ liệu đầu vào" }, { status: 400 });
        }

        const [rows] = await connection.execute(
            "SELECT * FROM account WHERE username = ?",
            [userName]
          );
      
          if (rows.length = 0) { 
            await connection.end();
            return new Response(
              JSON.stringify({ error: "Username is not exists" }),
              { status: 409, headers: { "Content-Type": "application/json" } }
            );
          }

        // Cập nhật thông tin user trong database
        const [result] = await connection.execute(
            "UPDATE account SET name = ?, avatar = ?, email = ? WHERE username = ? AND password = ?",
            [inputName, avatar, email, userName, password]
        );

        if (result.affectedRows === 0) {
            await connection.end();
            return NextResponse.json({ error: "Không thể cập nhật thông tin" }, { status: 400 });
        }

        // Lấy thông tin user mới sau khi cập nhật
        const [updatedUser] = await connection.execute(
            "SELECT * FROM account WHERE username = ? AND password = ?",
            [userName, password]
        );
        await connection.end();

        if (updatedUser.length === 0) {
            return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });
        }

        const user = updatedUser[0];

        const newToken = await generateToken(user);

        return NextResponse.json({
            message: "Cập nhật thông tin thành công",
            accessToken: newToken, 
            user, 
        }, { status: 200 });

    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
    }
}
