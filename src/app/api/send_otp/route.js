import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

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

        await redis.setex(`otp:${email}`, 300, otp);

        await sendEmail(email, otp);

        return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Error sending OTP: "+error  }, { status: 500 });
    }
}
