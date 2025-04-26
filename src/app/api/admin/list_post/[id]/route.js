import mysql from "mysql2/promise";
import { NextResponse } from "next/server";
import dbConfig from "../../../../../../dbConfig.js";

  export async function GET(req, {params}) {
    const body = await params;
    const id = body.id;
    console.log("Id:", id); 
    
    if (!id) {
        return NextResponse.json({ status: "error", message: "Invalid post ID" }, { status: 400 });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
    
        const [rows] = await connection.execute(
          "SELECT post.id as post_id, post.*, account.* FROM post left join account on post.user_id = account.id WHERE post.id = ?",
          [decodeURIComponent(id)]
        );
        
        await connection.end();
    
        if (rows.length === 0) {
          return NextResponse.json({ status: "error", message: "Post not found" }, { status: 404 });
        }
    
        return NextResponse.json({ status: "success", message: "Get detail post success", data: rows[0]}, { status: 200 });
      } catch (error) {
        console.error(error);
        return NextResponse.json({ status: "error", message: error }, { status: 500 });
      }
}
