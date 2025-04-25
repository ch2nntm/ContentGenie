import mysql from "mysql2/promise";
import fs from "fs";
import { NextResponse } from "next/server";

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

  export async function GET(req, {params}) {
    const body = await params;
    const id = body.id;
    console.log("Id:", id); 
    
    if (isNaN(id)) {
        return NextResponse.json({ status: "error", message: "Invalid user ID", error }, { status: 400 });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(
          `SELECT 
              ac.*, 
              COUNT(DISTINCT ps.id) AS count_post, 
              ug.package_buy,
              ug.price,
              ug.purchase_date
           FROM account ac 
           LEFT JOIN post ps ON ac.id = ps.user_id 
           LEFT JOIN user_upgrade ug ON ug.user_id = ac.id 
           WHERE ac.id = ? 
           GROUP BY ac.id, ug.package_buy, ug.price, ug.purchase_date`,
          [id]
        );

        await connection.end();
    
        if (rows.length === 0) {
          return NextResponse.json({ status: "error", message: "User not found", error }, { status: 404 });
        }
    
        return NextResponse.json( {status: "success", message: "Get detail user success", data: rows}, { status: 200 });
      } catch (error) {
        console.error(error);
        return NextResponse.json({ status: "error", message: "Database connection failed", error }, { status: 500 });
      }
}

// export async function DELETE(req, { params }) {
//   const id = params?.id;
//   console.log("Id:", id); 
  
//   if (!id) {
//       return NextResponse.json({ status: "error", message: "Missing post ID", error }, { status: 400 });
//   }

//   try {
//     const connection = await mysql.createConnection(dbConfig);
//     const [result] = await connection.execute(
//         "DELETE FROM account WHERE id = ?",
//         [id]
//     );

//     await connection.end();

//     if(result.affectedRows === 0) {
//         return NextResponse.json({ status: "error", message: "User not found", error }, { status: 400 });
//     }

//     return NextResponse({ status: "success", message: "Delete successful" }, { status: 200 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ status: "error", message: "Database connection failed", error },{ status: 500 });
//   }
// }