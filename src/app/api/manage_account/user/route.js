import mysql from "mysql2/promise";
import fs from "fs";
import { jwtVerify } from "jose";

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

const secretKey = new TextEncoder().encode("your-secret-key");

export async function GET(req) {
    try {
        // const cookieStore = cookies();
        // const token = (await cookieStore).get("token")?.value;
        const authHeader = req.headers.get("authorization"); 
        const token = authHeader?.split(" ")[1];

        console.log("Token: ",token);
        console.log("SecretKey: ",secretKey);
        if (!token) {
            return new Response(JSON.stringify({ message: "Missing token" }), { status: 401 });
        }

        try {
            const { payload } = await jwtVerify(token, secretKey);

            if (payload.role === 1) {
                const connection = await mysql.createConnection(dbConfig);
                const [rows] = await connection.execute("SELECT * FROM account WHERE role <> 1");
                await connection.end();

                return new Response(
                    JSON.stringify({ message: "Get list user successfully", users: rows }),
                    { status: 200, headers: { "Content-Type": "application/json" } }
                );
            } else {
                return new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 });
            }
        } catch (error) {
            console.error("JWT Verification Error: ", error);
            return new Response(JSON.stringify({ message: "Invalid token" }), { status: 401 });
        }
    } catch (error) {
        console.error("Database error:", error);
        return new Response(
            JSON.stringify({ error: "Database connection failed" }),
            { status: 500 }
        );
    }
}
