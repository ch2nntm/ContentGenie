import mysql from "mysql2/promise";
import { NextResponse } from "next/server";
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

export async function POST(req) {
    try{
        const {id} = await req.json();
        const connect = await mysql.createConnection(dbConfig);
        console.log("Id: ",id);
        const authHeader = req.headers.get("authorization"); 
        const token = authHeader?.split(" ")[1];

        if (!token) {
            return new Response(JSON.stringify({ message: "Missing token" }), { status: 401 });
        }


        if(!id){
            return NextResponse.json({error: "Missing field"}, {status: 402})
        }
        const [result] = await connect.execute(
            "SELECT credits FROM account WHERE id = ?",[id]
        );

        await connect.end();

        if(result.length === 0){
            throw new NextResponse.json({error}, {status: 400});
        }
        return NextResponse.json({data: result}, {status: 200});

    }catch(error){
        return NextResponse.json({error: error}, {status: 500});
    }
}

export async function PUT(req) {
    try{
        const {id} = await req.json();
        const connect = await mysql.createConnection(dbConfig);
        console.log("Id: ",id);

        const authHeader = req.headers.get("authorization"); 
        const token = authHeader?.split(" ")[1];

        if (!token) {
            return new Response(JSON.stringify({ message: "Missing token" }), { status: 401 });
        }


        if(!id){
            return NextResponse.json({error: "Missing field"}, {status: 402})
        }
        const [resultCheck] = await connect.execute(
            "SELECT credits FROM account WHERE id = ?", [id]
        );

        const data = resultCheck[0].credits;
        const number_update = data + 20;
        await connect.execute(
            "UPDATE account set credits = ? WHERE id = ?",[number_update, id]
        );

        await connect.end();

        return NextResponse.json({message: "Update success"}, {status: 200});

    }catch(error){
        console.log("error: ",error);
        return NextResponse.json({error: error}, {status: 500});
    }
}