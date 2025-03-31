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
        
        if (post.image) {
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
        }

        statusFormData.append("status", post.content);
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
            "UPDATE post SET id = ?, status = 1 WHERE id = ?",
            [postData.id, post.id]
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

let isScheduled = false;

export async function GET() {
    try {
        // const token_mastodon = cookies().get("mastodon_token")?.value;
        const cookieStore = await cookies();
        const token_mastodon = cookieStore.get("mastodon_token")?.value;
        if (!token_mastodon) {
            return NextResponse.json({ error: "Thiếu token Mastodon!" }, { status: 401 });
        }

        if (!isScheduled) {
            isScheduled = true;
            cron.schedule('* * * * *', async () => {
                console.log("Chạy cron job...");

                const connect = await mysql.createConnection(dbConfig);
                // const currentTime = new Date().toISOString().slice(0, 19).replace("T", " ");
                // console.log("CurrentTime: ",currentTime);
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
