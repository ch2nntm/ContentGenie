import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import dbConfig from "../../../../../dbConfig.js";

export async function PUT(req) {
    const authHeader = req.headers.get("authorization"); 
    const token = authHeader?.split(" ")[1];

    if (!token) {
        return NextResponse.json({ status: "error", message: "No tokens" }, { status: 401 });
    }

    try {
        const { content, image, id } = await req.json();
        const connection = await mysql.createConnection(dbConfig);
        if (!content) {
            return NextResponse.json({ status: "error", message: "Missing input data" }, { status: 400 });
        }

        const [checkExist] = await connection.execute(
            "SELECT * FROM post WHERE id = ?",
            [id]
        );
        if (checkExist.length === 0) {
            await connection.end();
            return NextResponse.json({ status: "error", message: "Post not found" }, { status: 404 });
        }
        
        const [result] = await connection.execute(
            "UPDATE post SET content = ?, image = ? WHERE id = ?",
            [content, image, id]
        );

        if (result.affectedRows === 0) {
            await connection.end();
            return NextResponse.json({ status: "error", message: "Unable to update post" }, { status: 400 });
        }

        return NextResponse.json({ status: "success", message: "Post updated successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ status: "error", message: error }, { status: 500 });
    }
}