import mysql from "mysql2/promise";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { jwtVerify } from "jose"; 
import dbConfig from "../../../../../dbConfig.js";

const secretKey = new TextEncoder().encode("your-secret-key"); 

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
        return NextResponse.json({ status: "error", message: "No tokens" }, { status: 401 });
    }
    console.log("Authorization Header:", token);
    console.log("SecretKey: ",secretKey);

    try {
        const { payload } = await jwtVerify(token, secretKey);
        console.log("Payload: ",payload);
        return NextResponse.json({ status: "success", message: "Get info user success", user: payload }, {status: 200});    
    }catch (error) {
            console.error("JWT Verification Error: ", error); 
            return NextResponse.json({ status: "error", message: "Invalid token" }, { status: 401 });
    }  
}


export async function POST(req) {
    try {
        const {email, password } = await req.json();

        const connection = await mysql.createConnection(dbConfig);
        const [rowsCheckEmail] = await connection.execute(
            "SELECT * FROM account WHERE email = ?",
            [email]
        );

        if(rowsCheckEmail.length === 0) {
            return NextResponse.json({ status: "error", message: "Email not found!" }, { status: 402 });
        }

        const [rows] = await connection.execute(
            "SELECT * FROM account WHERE email = ? AND password = ?",
            [email, password]
        );
        await connection.end();

        if (rows.length > 0) {
            const user = rows[0];
            const token = await generateToken(user);
            console.log("Authorization Header:", token);
            
            return NextResponse.json({ status: "success", message: "Log in successfully!", user, token }, { status: 200 });
        } else {
            return NextResponse.json({ status: "error", message: "Wrong password!" }, { status: 402 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: "error", message: error }, { status: 500 });
    }
}

