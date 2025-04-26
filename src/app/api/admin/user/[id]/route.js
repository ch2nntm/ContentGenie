import mysql from "mysql2/promise";
import { NextResponse } from "next/server";
import dbConfig from "../../../../../../dbConfig.js";

  export async function GET(req, {params}) {
    const body = await params;
    const id = body.id;
    console.log("Id:", id); 
    
    if (isNaN(id)) {
        return NextResponse.json({ status: "error", message: "Invalid user ID" }, { status: 400 });
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
          return NextResponse.json({ status: "error", message: "User not found" }, { status: 404 });
        }
    
        return NextResponse.json( {status: "success", message: "Get detail user success", data: rows}, { status: 200 });
      } catch (error) {
        console.error(error);
        return NextResponse.json({ status: "error", message: error }, { status: 500 });
      }
}
