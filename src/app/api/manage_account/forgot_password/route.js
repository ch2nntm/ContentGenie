import mysql from "mysql2/promise";
import { NextResponse } from "next/server";
import dbConfig from "../../../../../dbConfig.js";

export async function POST(req) {
    try{
        const {email} = await req.json();
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            "SELECT * FROM account WHERE email = ?",
            [email]
        );
      
        if (rows.length > 0) {
            return NextResponse.json({ status: "success", message: "Email is exist!" }, { status: 200 });
        } else {
            return NextResponse.json({ status: "error", message: "Wrong email!" },{ status: 400 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: "error", message: error },{ status: 500 });
    }
}

export async function PUT(req) {
    try {
        const { password, email } = await req.json();

        if (!password) {
            return NextResponse.json({ status: "error", message: "Missing password" }, { status: 400 });
        }

        const connection = await mysql.createConnection(dbConfig);

        const [resultExist] = await connection.execute(
            "SELECT password FROM account WHERE email = ?",
            [email]
        )
        console.log("resultExist:",resultExist);

        if(resultExist.affectedRows !== 0 && resultExist[0].password === password){
            console.log("resultExist:",resultExist);
            return NextResponse.json({ status: "error", message: "Old password matches new password" }, { status: 400 });;
        }

        const [result] = await connection.execute(
            "UPDATE account SET password = ? WHERE email = ?",
            [password, email]
        );

        await connection.end();

        if (result.affectedRows === 0) {
            return NextResponse.json({ status: "error", message: "Wrong email or account not found" }, { status: 400 });
        }

        return NextResponse.json({ status: "success", message: "Password updated successfully" }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: "error", message: error }, { status: 500 });
    }
}
