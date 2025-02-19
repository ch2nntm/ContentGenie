import mysql from "mysql2/promise";

const dbConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "testdbnextjs",
};

export async function POST(req) {
  try {
    const { name, username, password } = await req.json();

    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      "SELECT * FROM account WHERE username = ? AND password = ?",
      [username, password]
    );

    if (rows.length > 0) { 
      await connection.end();
      return new Response(
        JSON.stringify({ error: "Username already exists" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    await connection.execute(
      "INSERT INTO account (name, username, password) VALUES (?, ?, ?)",
      [name, username, password]
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

