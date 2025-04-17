import { NextResponse } from "next/server";
import crypto from "crypto";

const checksum_key = process.env.NEXT_PUBLIC_PAYOS_CHECKSUM;
const api_key = process.env.NEXT_PUBLIC_PAYOS_API;
const client_id = process.env.NEXT_PUBLIC_PAYOS_CLIENT_ID;
const base_url = process.env.NEXT_PUBLIC_PAYOS_BASE_URL;

export async function POST(req) {
  try {
    const body = await req.json();
    const public_url = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL : process.env.NEXTAUTH_URL;

    const cancelUrl = public_url+body.cancelUrl;
    const returnUrl = public_url+body.returnUrl

    const generateCode = () => Math.floor(Math.random() * 100000);
    const orderCode = generateCode();

    const data = `amount=${body.amount}&cancelUrl=${cancelUrl}&description=${body.description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;

    const signature = crypto
      .createHmac('sha256', checksum_key)
      .update(data)
      .digest('hex');

    console.log("orderCode:", orderCode);

    const payload = {
      orderCode: orderCode,
      amount: body.amount,
      description: body.description,
      cancelUrl:  cancelUrl,
      returnUrl: returnUrl,
      signature: signature,  
    };

    const response = await fetch(`${base_url}/payment-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": api_key,
        "x-client-id": client_id,
      },
      body: JSON.stringify(payload),
    });

    const dataResponse = await response.json();
    console.log("Response từ PayOS:", dataResponse);

    if (dataResponse.code === "00") {
        return NextResponse.json({ status: "success", message: "Create link success", data: dataResponse }, { status: 200 });
    } else {
      console.error(`Error from PayOS: ${dataResponse.desc}`);
      return NextResponse.json({ status: "error", message: dataResponse.desc, error }, { status: 400 });
    }

  } catch (error) {
    console.error("Error creating payment request:", error);
    return NextResponse.json({ status: "error", message: "Error creating payment request: ", error }, { status: 500 });
  }
}


export async function GET(req) {
  try{
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    console.log("ID từ client:", id);
    const api_key = process.env.NEXT_PUBLIC_PAYOS_API;
    const client_id = process.env.NEXT_PUBLIC_PAYOS_CLIENT_ID;

    const response = await fetch(`${base_url}/payment-requests/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": api_key,
        "x-client-id": client_id,
      },
    });
  
    const dataResponse = await response.json();
    console.log("Response từ PayOS:", dataResponse.data.status);
    return NextResponse.json({ status: "success", message: "Get orderCode success", data: dataResponse }, { status: 200 });
  }catch(error){
    return NextResponse.json({ status: "error", message: "Missing wrong", error }, { status: 500 });
  }
}