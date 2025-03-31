import { NextResponse } from "next/server";
import Redis from "ioredis";
import nodemailer from "nodemailer";

const redis = new Redis(process.env.REDIS_URL);

const sendEmail = async (email, password, message1, message2) => {
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
        text: `${message1}${email}, ${message2}${password}`,
    });
};

export async function POST(req) {
    try {
        const { email, otp, password, message1, message2 } = await req.json();
        if (!email || !otp || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        const storedOTP = await redis.get(`otp:${email}`);

        if (!storedOTP) return NextResponse.json({ error: "OTP expired or invalid" }, { status: 400 });
        if (storedOTP !== otp) return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });

        await sendEmail(email, password, message1, message2);

        await redis.del(`otp:${email}`);

        return NextResponse.json({ message: "OTP verified successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Error verifying OTP: "+error }, { status: 500 });
    }
}

export async function PUT(req){
    try {
        const { oldEmail, newEmail, password, message1, message2 } = await req.json();
        if (!oldEmail || !newEmail || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        if(oldEmail === newEmail) return NextResponse.json({ error: "Emails match" }, { status: 400 });

        await sendEmail(newEmail, password, message1, message2);
        return NextResponse.json({ message: "Email update successfully" }, { status: 200 });
    }catch (error) {
        return NextResponse.json({ error: "Error update email: "+error }, { status: 500 });
    }
}