import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import fs from "fs";

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
    const statusId = params?.id;
    console.log("Id: ",statusId);
    try{
        const response = await fetch(`${process.env.MASTODON_INSTANCE}/api/v1/statuses/${statusId}`,{
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.MASTODON_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            }
        })

        if(!response.ok){
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to post data");
        }

        const data = await response.json();
        return NextResponse.json({success: true, data}, {status:200});
    }catch(error){
        return NextResponse.json({error: "Internal Server Error"},{status: 500});
    }
}

export async function DELETE(req, { params }) {
    const statusId = params?.id;
    console.log("Id:", statusId); 
    
    if (!statusId) {
        return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            "DELETE FROM post WHERE id = ?",
            [statusId]
        );

        await connection.end();

        const mastodonResponse = await fetch(`${process.env.MASTODON_INSTANCE}/api/v1/statuses/${statusId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${process.env.MASTODON_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            }
        });

        if (!mastodonResponse.ok) {
            const errorData = await mastodonResponse.json();
            throw new Error(errorData.error || "Failed to delete post on Mastodon");
        }

        return NextResponse.json({ success: true, message: "Post deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error deleting post:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


export async function PUT(req, {params}) {
    try{
        const formData = await req.formData();
        const content = formData.get("content");
        const imageUrl = formData.get("image");
        const statusId = params?.id;

        console.log("Content: ",content);
        console.log("Image: ",imageUrl);

        if(!imageUrl || !content){
        return NextResponse.json({error: "Missing the field"}, {status: 400});
        }

        const imageResponse = await fetch(imageUrl);
        if(!imageResponse.ok){
        throw new Error("Don't upload image from Cloudary");
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        const imageBlob = new Blob([imageBuffer], {type: 'image/png'});

        const mediaFormData = new FormData();
        mediaFormData.append("file", imageBlob, "image.png");
        const mediaResponse = await fetch(`${process.env.MASTODON_INSTANCE}/api/v1/media`,{
            method: "POST",
            headers:{
            "Authorization": `Bearer ${process.env.MASTODON_ACCESS_TOKEN}`,
            },
            body: mediaFormData,
        });
    
        if(!mediaResponse.ok){
            const errorData = await mediaResponse.json();
            throw new Error(errorData.error || "Failed to upload media");
        }
    
        const mediaData = await mediaResponse.json();
        console.log("Image was uploaded to Mastodon: ",mediaData);
    
        const statusFormData = new URLSearchParams();
        statusFormData.append("status",content);
        statusFormData.append("media_ids[]",mediaData.id);
    
        const statusResponse = await fetch(`${process.env.MASTODON_INSTANCE}/api/v1/statuses/${statusId}`,{
            method: "PUT",
            headers:{
            "Authorization": `Bearer ${process.env.MASTODON_ACCESS_TOKEN}`,
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