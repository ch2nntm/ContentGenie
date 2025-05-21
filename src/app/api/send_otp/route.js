import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendEmail = async (email, otp, subject, text, ex) => {
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
        subject: subject,
        text: text + ` ${otp}. ` + ex,
    });
};

export async function POST(req) {
    try {
        const { email, subject, text, ex } = await req.json();
        if (!email || !subject || !text || !ex ) 
            return NextResponse.json({ status: "error", message: "Fields is required" }, { status: 400 });

        const otp = generateOTP();

        const storedOTP = await redis.get(`otp:${email}`);
        if(storedOTP){
            await redis.del(`otp:${email}`);
        }

        await redis.set(`otp:${email}`, otp, { ex: 300 });

        await sendEmail(email, otp, subject, text, ex);

        return NextResponse.json({ status: "success", message: "OTP sent successfully" }, { status: 200 });
    } catch (error) {
        console.log("Error sending OTP:", error);
        return NextResponse.json({ status: "error", message: error  }, { status: 500 });
    }
}
