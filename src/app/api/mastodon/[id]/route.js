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

export async function GET(req, {params}) {
    const body = await params;
    const statusId = body?.id;
    console.log("Id: ",statusId);

    const cookieStore = await cookies();
    const token_mastodon = cookieStore.get("mastodon_token")?.value;
    console.log("Token từ cookies: ", token_mastodon);

    if (!token_mastodon) {
        return NextResponse.json({ message: "No token provided" }, { status: 401 });
    }

    try{
        const response = await fetch(`${process.env.MASTODON_INSTANCE}/api/v1/statuses/${statusId}`,{
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token_mastodon}`,
                "Content-Type": "application/json",
            }
        })
        const data = await response.json();

        if(!response.ok){
            console.log("responseok");
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to post data");
        }
        return NextResponse.json({success: true, data: data}, {status:200});
    }catch(error){
        return NextResponse.json({error: "Internal Server Error: ",error},{status: 500});
    }
}

export async function DELETE(req, { params }) {
    const statusId = params?.id;
    console.log("Id:", statusId); 
    const cookieStore = await cookies();
    const token_mastodon = cookieStore.get("mastodon_token")?.value;
    console.log("Token từ cookies: ", token_mastodon);

    if (!token_mastodon) {
        return NextResponse.json({ message: "No token provided" }, { status: 401 });
    }
    
    if (!statusId) {
        return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);

        const [result] = await connection.execute(
            "SELECT status FROM post WHERE id = ?",
            [statusId]
        );

        if(result[0].status === 1){
            const mastodonResponse = await fetch(`${process.env.MASTODON_INSTANCE}/api/v1/statuses/${statusId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token_mastodon}`,
                    "Content-Type": "application/json",
                }
            });
    
            if (!mastodonResponse.ok) {
                const errorData = await mastodonResponse.json();
                throw new Error(errorData.error || "Failed to delete post on Mastodon");
            }
        }

        const [] = await connection.execute(
            "DELETE FROM post WHERE id = ?",
            [statusId]
        );

        await connection.end();

        return NextResponse.json({ success: true, message: "Post deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error deleting post:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


export async function PUT(req, {params}) {
    try{
        const cookieStore = await cookies();
        const token_mastodon = cookieStore.get("mastodon_token")?.value;
        console.log("Token từ cookies: ", token_mastodon);

        if (!token_mastodon) {
            return NextResponse.json({ message: "No token provided" }, { status: 401 });
        }
    
        const formData = await req.formData();
        const content = formData.get("content");
        const imageUrl = formData.get("image");
        const body = await params;
        const statusId = body?.id;

        console.log("Content: ",content);
        console.log("Image: ",imageUrl);

        const statusFormData = new URLSearchParams();

        if(!content){
            return NextResponse.json({error: "Missing the field"}, {status: 400});
        }
        statusFormData.append("status",content);

        if(imageUrl){
            const newImageUrl = imageUrl.slice(0, -4) + ".png";
            console.log("Image URL: ",newImageUrl);
            const imageResponse = await fetch(newImageUrl);
            if(!imageResponse.ok){
                throw new Error("Don't upload image from Cloudary");
            }

            const imageBuffer = await imageResponse.arrayBuffer();
            const contentType = imageResponse.headers.get("content-type") || "image/png";
            const imageBlob = new Blob([imageBuffer], { type: contentType });

            const mediaFormData = new FormData();
            mediaFormData.append("file", imageBlob, "media-file");
        
            const mediaResponse = await fetch(`${process.env.MASTODON_INSTANCE}/api/v1/media`,{
                method: "POST",
                headers:{
                "Authorization": `Bearer ${token_mastodon}`,
                },
                body: mediaFormData,
            });
        
            if(!mediaResponse.ok){
                const errorData = await mediaResponse.json();
                throw new Error(errorData.error || "Failed to upload media");
            }
        
            const mediaData = await mediaResponse.json();
            console.log("Image was uploaded to Mastodon: ",mediaData);
        
            statusFormData.append("media_ids[]",mediaData.id);
        }
        
    
        const statusResponse = await fetch(`${process.env.MASTODON_INSTANCE}/api/v1/statuses/${statusId}`,{
            method: "PUT",
            headers:{
            "Authorization": `Bearer ${token_mastodon}`,
            "Content-Type": "application/x-www-form-urlencoded",
            },
            body: statusFormData,
        });
    
        if(!statusResponse.ok){
            const errorData = await statusResponse.json();
            throw new Error(errorData.error || "Failed to post status");
        }
    
        const postData = await statusResponse.json();
        console.log("Post: ",postData);
    
        return NextResponse.json({success: true, postData}, {status: 200});
    }catch(error){
      console.error("Error: ",error);
      return NextResponse.json({error: error.message}, {status: 500});
    }
}