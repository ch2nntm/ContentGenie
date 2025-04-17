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
        return NextResponse.json({ status: "error", message: "No tokens", error }, { status: 401 });
    }

    try {
        const { password, inputName, avatar, inputEmail, email} = await req.json();
        console.log("inputEmail: ",inputEmail," - email: ",email);
        const connection = await mysql.createConnection(dbConfig);
        if (!password || !inputName || !inputEmail || !email) {
            return NextResponse.json({ status: "error", message: "Missing input data", error }, { status: 400 });
        }

        if(inputEmail !== email){
            const [rows] = await connection.execute(
                "SELECT * FROM account WHERE email = ?",
                [inputEmail]
            );
          
            if (rows.length = 0) { 
                await connection.end();
                return NextResponse.json({ status: "error", message: "Email is not exists", error },{ status: 409});
            }
        }

        const [result] = await connection.execute(
            "UPDATE account SET name = ?, avatar = ?, email = ? WHERE email = ? AND password = ?",
            [inputName, avatar, inputEmail, email, password]
        );

        if (result.affectedRows === 0) {
            await connection.end();
            return NextResponse.json({ status: "error", message: "Unable to update information", error }, { status: 400 });
        }

        const [updatedUser] = await connection.execute(
            "SELECT * FROM account WHERE email = ? AND password = ?",
            [inputEmail, password]
        );
        await connection.end();

        if (updatedUser.length === 0) {
            return NextResponse.json({ status: "error", message: "User not found", error }, { status: 404 });
        }

        const user = updatedUser[0];

        const newToken = await generateToken(user);

        return NextResponse.json({
            status: "success",
            message: "Information updated successfully",
            accessToken: newToken, 
            data: user, 
        }, { status: 200 });

    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ status: "error", message: "System error", error }, { status: 500 });
    }
}
