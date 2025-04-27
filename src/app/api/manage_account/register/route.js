import mysql from "mysql2/promise";
import dbConfig from "../../../../../dbConfig.js";
import { NextResponse } from "next/server.js";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      "SELECT * FROM account WHERE email = ?",
      [email]
    );

    if (rows.length > 0) { 
      await connection.end();
      return NextResponse.json({ status: "error", message: "Email already exists" }, { status: 409 });
    }

    await connection.execute(
      "INSERT INTO account (email, name, avatar, password, role, credits, expiration_date) VALUES (?, ?, '', ?, 0, 20, null)",
      [email,name, password]
    );

    await connection.end(); 

    return NextResponse.json({ status: "success", message: "Account created successfully" }, { status: 201 });

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ status: "error", message: error },{ status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ status: "error", message: "Email is required" }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      "SELECT * FROM account WHERE email = ?",
      [email]
    );

    await connection.end();

    if (rows.length > 0) {
      return NextResponse.json({ status: "error", message: "Email is exist" }, { status: 400 });
    }

    return NextResponse.json({ status: "success", message: "Email is not exist" }, { status: 200 });

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}