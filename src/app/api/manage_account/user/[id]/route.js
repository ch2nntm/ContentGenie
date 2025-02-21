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

  export async function GET(req, content) {
    const {params} = await content;
    const id = params?.id;
    
    if (isNaN(id)) {
        return new Response(JSON.stringify({ error: "Invalid user ID" }), {
            status: 400,
        });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
    
        const [rows] = await connection.execute(
          "SELECT * FROM account WHERE id = ?",
          [id]
        );
        await connection.end();
    
        if (rows.length === 0) {
          return new Response(JSON.stringify({ error: "User not found" }), {
            status: 404,
          });
        }
    
        return new Response(JSON.stringify(rows[0]), { status: 200 });
      } catch (error) {
        console.error(error);
        return new Response(
          JSON.stringify({ error: "Database connection failed" }),
          { status: 500 }
        );
      }
}
