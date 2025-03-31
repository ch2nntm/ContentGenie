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
// export async function POST(req) {
//     const authHeader = req.headers.get("authorization"); 
//     const token = authHeader?.split(" ")[1];

//     if (!token) {
//         return NextResponse.json({ message: "No tokens" }, { status: 401 });
//     }

//     try {
//         const {inputEmail, email} = await req.json();
//         console.log("inputEmail: ",inputEmail," - email: ",email);
//         const connection = await mysql.createConnection(dbConfig);
//         if (!inputEmail || !email) {
//             return NextResponse.json({ error: "Thiếu dữ liệu đầu vào" }, { status: 400 });
//         }

//         const [rows] = await connection.execute(
//             "SELECT * FROM account WHERE email = ?",
//             [inputEmail]
//         );
        
//         if (rows.length > 0) { 
//             await connection.end();
//             return new Response(
//                 JSON.stringify({ error: "Email is exists" }),
//                 { status: 409, headers: { "Content-Type": "application/json" } }
//             );
//         }

//         return NextResponse.json({
//             message: "Email is not exists",
//         }, { status: 200 });
//     }catch (error) {
//         console.error("Error: ", error);
//         return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
//     }
// }

export async function PUT(req) {
    const authHeader = req.headers.get("authorization"); 
    const token = authHeader?.split(" ")[1];

    if (!token) {
        return NextResponse.json({ message: "No tokens" }, { status: 401 });
    }

    try {
        const { password, inputName, avatar, inputEmail, email} = await req.json();
        console.log("inputEmail: ",inputEmail," - email: ",email);
        const connection = await mysql.createConnection(dbConfig);
        if (!password || !inputName || !inputEmail || !email) {
            return NextResponse.json({ error: "Thiếu dữ liệu đầu vào" }, { status: 400 });
        }

        if(inputEmail !== email){
            const [rows] = await connection.execute(
                "SELECT * FROM account WHERE email = ?",
                [inputEmail]
            );
          
            if (rows.length = 0) { 
                await connection.end();
                return new Response(
                    JSON.stringify({ error: "Email is not exists" }),
                    { status: 409, headers: { "Content-Type": "application/json" } }
                );
            }
        }

        const [result] = await connection.execute(
            "UPDATE account SET name = ?, avatar = ?, email = ? WHERE email = ? AND password = ?",
            [inputName, avatar, inputEmail, email, password]
        );

        if (result.affectedRows === 0) {
            await connection.end();
            return NextResponse.json({ error: "Không thể cập nhật thông tin" }, { status: 400 });
        }

        const [updatedUser] = await connection.execute(
            "SELECT * FROM account WHERE email = ? AND password = ?",
            [inputEmail, password]
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
