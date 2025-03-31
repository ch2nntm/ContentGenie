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

        if(!id){
            return NextResponse.json({error: "Missing field"}, {status: 402})
        }
        const [result] = await connect.execute(
            "SELECT credits FROM account WHERE id = 1"
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