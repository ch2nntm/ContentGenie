import mysql from "mysql2/promise";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import dbConfig from "../../../../../dbConfig.js";

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
        return NextResponse.json({ status: "error", message: "No tokens" }, { status: 401 });
    }

    try {
        const { email, password, newPassword } = await req.json();

        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            "UPDATE account SET password = ? WHERE email = ? AND password = ?",
            [newPassword, email, password]
        );

        if (result.affectedRows === 0) {
            await connection.end();
            return NextResponse.json({ status: "error", message: "Incorrect username or password" }, { status: 400 });
        }

        const [updatedUser] = await connection.execute(
            "SELECT * FROM account WHERE email = ? AND password = ?",
            [email, newPassword]
        );
        await connection.end();

        if (updatedUser.length === 0) {
            return NextResponse.json({ status: "error", message: "User not found" }, { status: 404 });
        }

        const user = updatedUser[0];

        // Tạo token mới
        const newToken = await generateToken(user);

        return NextResponse.json({
            status: "success",
            message: "Password has been changed successfully",
            accessToken: newToken, 
            data: user, 
        }, { status: 200 });

    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ status: "error", message: error }, { status: 500 });
    }
}
