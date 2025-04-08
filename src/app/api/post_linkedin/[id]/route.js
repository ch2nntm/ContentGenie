import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import fs from "fs";
import { cookies } from "next/headers";

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

export async function DELETE(req, { params }) {
    try {
        const postId = params?.id;
        console.log("Id:", postId); 
        const cookieStore = await cookies();
        const token_linkedin = cookieStore.get("linkedin_access_token")?.value;
        console.log("Token từ cookies: ", token_linkedin);
    
        if (!token_linkedin) {
            return NextResponse.json({ message: "No token provided" }, { status: 401 });
        }

        const connection = await mysql.createConnection(dbConfig);

        const [result] = await connection.execute(
            "SELECT status FROM post WHERE id = ?",
            [postId]
        );

        if(result[0].status === 1){
            const response = await fetch(`https://api.linkedin.com/v2/ugcPosts/${encodeURIComponent(postId)}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token_linkedin}`,
                    "X-Restli-Protocol-Version": "2.0.0",
                    "LinkedIn-Version": "202504"
                }
            });
            if(!response.ok){
                console.log("Error: ",response.text);
            }
        }

        const [] = await connection.execute(
            "DELETE FROM post WHERE id = ?",
            [postId]
        );

        await connection.end();

        return NextResponse.json({message: "Delete post success"}, { status: 200 });
    } catch (error) {
      console.error("Token Decode Error:", error);
      return NextResponse.json({ error: "Failed to decode ID Token" }, { status: 500 });
    }
  }