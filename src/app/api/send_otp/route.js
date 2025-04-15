import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
// import Redis from "ioredis";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// const redis = new Redis(process.env.REDIS_URL);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendEmail = async (email, otp) => {
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
        subject: "Mã OTP của bạn",
        text: `Mã OTP của bạn là: ${otp} (Hết hạn sau 5 phút).`,
    });

};

export async function POST(req) {
    try {
        const { email } = await req.json();
        if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

        const otp = generateOTP();

        const storedOTP = await redis.get(`otp:${email}`);
        if(storedOTP){
            await redis.del(`otp:${email}`);
        }

        await redis.set(`otp:${email}`, otp, { ex: 30 });

        await sendEmail(email, otp);

        return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
    } catch (error) {
        console.log("Error sending OTP:", error);
        return NextResponse.json({ error: "Error sending OTP: "+error  }, { status: 500 });
    }
}
