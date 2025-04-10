import { NextResponse } from 'next/server';
import cron from 'node-cron';
import mysql from "mysql2/promise";
import fs from "fs";
import { cookies } from 'next/headers';
import nodemailer from "nodemailer";

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

const sendEmail = async (email) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, 
        },
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Thông Báo Xác Nhận",
        text: `Đăng bài thành công!`,
    });
};

async function postToMastodon(post, token_mastodon) {
    try {
        if (!token_mastodon) throw new Error("Thiếu token Mastodon!");

        const statusFormData = new URLSearchParams();
        const connection = await mysql.createConnection(dbConfig);

        let fullContent = post.content;
        const isYouTube = post.image?.includes("youtube.com") || post.image?.includes("youtu.be");

        
        if (post.image && !isYouTube) {
            const imageResponse = await fetch(post.image);
            if (!imageResponse.ok) throw new Error("Không tải được ảnh từ Cloudinary");

            const imageBuffer = await imageResponse.arrayBuffer();
            const imageBlob = new Blob([imageBuffer], {type: 'image/png'});

            const mediaFormData = new FormData();
            mediaFormData.append("file", imageBlob, "image.png");   

            const mediaResponse = await fetch(`${process.env.MASTODON_INSTANCE}/api/v1/media`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token_mastodon}`,
                },
                body: mediaFormData,
            });

            if (!mediaResponse.ok) {
                const errorData = await mediaResponse.json();
                throw new Error(errorData.error || "Lỗi khi tải ảnh lên Mastodon");
            }

            const mediaData = await mediaResponse.json();
            console.log("Ảnh đã tải lên Mastodon: ", mediaData);
            statusFormData.append("media_ids[]", mediaData.id);
        }else if (isYouTube) {
          fullContent += `\n\n📺 Video: ${post.image}`;
        }

        statusFormData.append("status", fullContent);
        statusFormData.append("visibility", post.audience);

        const statusResponse = await fetch(`${process.env.MASTODON_INSTANCE}/api/v1/statuses`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token_mastodon}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: statusFormData,
        });

        if (!statusResponse.ok) {
            const errorData = await statusResponse.json();
            throw new Error(errorData.error || "Lỗi khi đăng bài lên Mastodon");
        }

        const postData = await statusResponse.json();
        console.log("Bài đăng: ", postData);
        await connection.execute(
            "UPDATE post SET id = ?, status = 1, posttime = ? WHERE id = ?",
            [postData.id, new Date(), post.id]
        );

        const email = await connection.execute(
            "SELECT email FROM account WHERE id = ?", [post.user_id]
        );
        console.log("Email: ",email[0][0].email," - user_id: ",post.user_id);

        sendEmail(email[0][0].email);

        await connection.end();

    } catch (error) {
        console.error("Lỗi đăng bài Mastodon: ", error);
    }
}

async function postToLinkedin(post, token_linkedin, sub_ID) {
    try{
        const connection = await mysql.createConnection(dbConfig);
        if(post.image === null){
          const postData = {
            author: `urn:li:person:${sub_ID}`,
            lifecycleState: "PUBLISHED",
            specificContent: {
              "com.linkedin.ugc.ShareContent": {
                shareCommentary: { text: post.content },
                shareMediaCategory: "NONE"
              },
            },
            visibility: { "com.linkedin.ugc.MemberNetworkVisibility": post.audience === "public" ? "PUBLIC" : "CONNECTIONS" }, 
          };
        
          const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token_linkedin}`,
              "Content-Type": "application/json",
              "X-Restli-Protocol-Version": "2.0.0",
            },
            body: JSON.stringify(postData),
          });
        
          const data = await response.json();
          console.log("DATA: ",data);
        
          if (response.ok) {
            await connection.execute(
                "UPDATE post SET id = ?, status = 1, posttime = ? WHERE id = ?",
                [data.id, new Date(), post.id]
            );
    
            const email = await connection.execute(
                "SELECT email FROM account WHERE id = ?", [post.user_id]
            );
            console.log("Email: ",email[0][0].email," - user_id: ",post.user_id);
    
            sendEmail(email[0][0].email);
    
            await connection.end();
            return NextResponse.json({ success: true, postId: data });
          } else {
            return NextResponse.json({ error: "Failed to post", details: data }, { status: 400 });
          }
        }
        else{
          //Register the image
          const registerUploadRequest = {
            registerUploadRequest: {
              owner: `urn:li:person:${sub_ID}`, 
              recipes: [
                "urn:li:digitalmediaRecipe:feedshare-image"
              ],
              serviceRelationships: [
                {
                  identifier: "urn:li:userGeneratedContent",
                  relationshipType: "OWNER"
                }
              ]
            }
          };
    
          try {
            const response = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token_linkedin}`,  
                'LinkedIn-Version': '202503',         
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
              },
              body: JSON.stringify(registerUploadRequest) 
            });
        
            const data = await response.json();
            console.log("data.value.uploadMechanism: ",data);
            const uploadUrl = data.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;
    
            // const imageUrl = image;
            const imageResponse = await fetch(post.image);
            if (!imageResponse.ok) throw new Error("Failed to fetch image");
            const imageBuffer = await imageResponse.arrayBuffer();
            const assets = data.value.asset;
    
            // Upload Image Binary File
            const responseUploadUrl = await fetch(uploadUrl,{
              method: "POST",
              headers: {
                'Authorization': `Bearer ${token_linkedin}`,
                'Content-Type': 'image/jpeg',
                'media-type-family': 'STILLIMAGE'
              },
              body: imageBuffer
            });
    
            if(responseUploadUrl.status === 201){
              // Create the Image Share
              const postData = {
                author: `urn:li:person:${sub_ID}`,
                lifecycleState: "PUBLISHED",
                specificContent: {
                  "com.linkedin.ugc.ShareContent": {
                    shareCommentary: { text: post.content },
                    shareMediaCategory: "IMAGE",
                      media: [
                          {
                              status: "READY",
                              description: {
                                  text: "Center stage!"
                              },
                              media: `${assets}`,
                              title: {
                                  text: "LinkedIn Talent Connect 2025"
                              }
                          }
                      ]
                  },
                },
                visibility: { "com.linkedin.ugc.MemberNetworkVisibility": post.audience === "public" ? "PUBLIC" : "CONNECTIONS" }, 
              };
            
              const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${token_linkedin}`,
                  "Content-Type": "application/json",
                  "X-Restli-Protocol-Version": "2.0.0",
                },
                body: JSON.stringify(postData),
              });
    
              const dataResult = await response.json();
              if (response.ok) {
                await connection.execute(
                    "UPDATE post SET id = ?, status = 1, posttime = ? WHERE id = ?",
                    [dataResult.id, new Date(), post.id]
                );
        
                const email = await connection.execute(
                    "SELECT email FROM account WHERE id = ?", [post.user_id]
                );
                console.log("Email: ",email[0][0].email," - user_id: ",post.user_id);
        
                sendEmail(email[0][0].email);
        
                await connection.end();
                return NextResponse.json({ success: true, postId: dataResult });
              } else {
                return NextResponse.json({ error: "Failed to post", details: data }, { status: 400 });
              }
            }
            
            return NextResponse.json({error},{status: 400});
          } catch (error) {
            console.error('Error during the upload process:', error);
          }
        return NextResponse.json({message: "Error"}, {status: 400});
        }
      }catch(error){
        console.log("error: ",error);
        return NextResponse.json({error}, {status: 500});
      }
}


let isScheduled = false;

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token_mastodon = cookieStore.get("mastodon_token")?.value;
        const token_linkedin = cookieStore.get("linkedin_access_token")?.value;
        if (!token_mastodon) {
            return NextResponse.json({ error: "Thiếu token Mastodon!" }, { status: 401 });
        }

        const response = await fetch("https://api.linkedin.com/v2/userinfo", {
            method: "GET",
            headers: { Authorization: `Bearer ${token_linkedin}` },
        });
        
        const data = await response.json();

        const sub_ID = data.sub;

        console.log("token_linkedin: ",token_linkedin);

        if (!isScheduled) {
            isScheduled = true;
            cron.schedule('* * * * *', async () => {
                console.log("Chạy cron job...");

                const connect = await mysql.createConnection(dbConfig);
                const currentTime =  new Date().toLocaleString("en-CA", { 
                    timeZone: "Asia/Ho_Chi_Minh", 
                    hour12: false 
                }).replace(",", "");
                console.log("CurrentTime: ",currentTime);

                const [resultPost] = await connect.execute(
                    "SELECT * FROM post WHERE post.posttime <= ? AND post.status = 0", [currentTime]
                );

                if (resultPost.length > 0) {
                    for (let post of resultPost) {
                        if (post.platform === "Mastodon") {
                            await postToMastodon(post, token_mastodon);
                        }
                        else{
                            await postToLinkedin(post, token_linkedin, sub_ID);
                        }
                    }
                }
                await connect.end();
            });
        }

        return NextResponse.json({ message: "Scheduler is running" }, { status: 200 });

    } catch (error) {
        console.error("Lỗi: ", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
