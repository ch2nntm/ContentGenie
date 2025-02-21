import mysql from "mysql2/promise";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { jwtVerify } from "jose"; 
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
  

const secretKey = new TextEncoder().encode("your-secret-key"); //khóa bí mật dùng để ký JWT (JSON Web Token), thành một dạng Uint8Array (mảng byte).

// Hàm tạo JWT
// payload: Chứa dữ liệu cần mã hóa bên trong JWT (thường là thông tin user).
// async: Vì hàm sử dụng await nên cần khai báo async để làm việc với Promise.
async function generateToken(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h") 
        .sign(secretKey);
}

export async function GET(request) {
    const authHeader = request.headers.get("authorization"); 
    const token = authHeader?.split(" ")[1];

    if (!token) {
        return NextResponse.json({ message: "No tokens" }, { status: 401 });
    }
    console.log("Authorization Header:", token);
    console.log("SecretKey: ",secretKey);

    try {
        const { payload } = await jwtVerify(token, secretKey);
        console.log("Payload: ",payload);
        return NextResponse.json({ user: payload });    
    }catch (error) {
            console.error("JWT Verification Error: ", error); 
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }  
}


export async function POST(req) {
    try {
        const {username, password } = await req.json();

        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            "SELECT * FROM account WHERE username = ? AND password = ?",
            [username, password]
        );
        await connection.end();

        if (rows.length > 0) {
            const user = rows[0];
            const token = await generateToken(user);
            console.log("Authorization Header:", token);
            return NextResponse.json({ message: "Log in successfully!", user, token }, { status: 200 });
        } else {
            return new Response(
                JSON.stringify({ error: "Wrong account or password!" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
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

