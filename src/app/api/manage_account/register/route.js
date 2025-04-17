import mysql from "mysql2/promise";
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
      return new Response(
        JSON.stringify({ error: "Email already exists" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    await connection.execute(
      "INSERT INTO account (email, name, avatar, password, role, credits, expiration_date, purchase_date) VALUES (?, ?, '', ?, 0, 20, '', '')",
      [email,name, password]
    );

    await connection.end(); 

    return new Response(
      JSON.stringify({ message: "Account created successfully" }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Database error:", error);
    return new Response(
      JSON.stringify({ error: "Database connection failed" }),
      { status: 500 }
    );
  }
}