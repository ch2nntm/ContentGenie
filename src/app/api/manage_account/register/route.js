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

    return NextResponse.json({ status: "error", message: "Account created successfully" }, { status: 201 });

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ status: "error", message: error },{ status: 500 });
  }
}