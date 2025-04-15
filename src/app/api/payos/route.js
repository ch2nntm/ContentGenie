import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  try {
    const body = await req.json();
    const checksum_key = process.env.NEXT_PUBLIC_PAYOS_CHECKSUM;
    const api_key = process.env.NEXT_PUBLIC_PAYOS_API;
    const client_id = process.env.NEXT_PUBLIC_PAYOS_CLIENT_ID;
    const base_url = process.env.NEXT_PUBLIC_PAYOS_BASE_URL;

    const public_url = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:3000/';

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
        return NextResponse.json({ paymentUrl: dataResponse }, { status: 200 });
    } else {
      console.error(`Lỗi từ PayOS: ${dataResponse.desc}`);
      return NextResponse.json({ error: dataResponse.desc }, { status: 400 });
    }

  } catch (error) {
    console.error("Lỗi khi tạo yêu cầu thanh toán:", error);
    return NextResponse.json({ error: "Lỗi khi tạo yêu cầu thanh toán: ",error }, { status: 500 });
  }
}


export async function GET(req) {
  try{
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    console.log("ID từ client:", id);
    const api_key = process.env.NEXT_PUBLIC_PAYOS_API;
    const client_id = process.env.NEXT_PUBLIC_PAYOS_CLIENT_ID;

    const response = await fetch(`https://api-merchant.payos.vn/v2/payment-requests/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": api_key,
        "x-client-id": client_id,
      },
    });
  
    const dataResponse = await response.json();
    console.log("Response từ PayOS:", dataResponse.data.status);
    return NextResponse.json({ dataResponse: dataResponse }, { status: 200 });
  }catch(error){
    return NextResponse.json({ error }, { status: 500 });
  }
}