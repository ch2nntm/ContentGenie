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
            return NextResponse.json({ status: "error", message: "Missing token", error }, { status: 401 });
        }

        if(!id){
            return NextResponse.json({ status: "error", message: "Missing field", error}, {status: 402})
        }
        const [result] = await connect.execute(
            "SELECT credits, expiration_date FROM account WHERE id = ?",[id]
        );

        await connect.end();

        if(result.length === 0){
            throw new NextResponse.json({error}, {status: 400});
        }
        return NextResponse.json({ status: "success", message: "Check credits success", data: result}, {status: 200});

    }catch(error){
        return NextResponse.json({ status: "error", message: "Something went wrong", error}, {status: 500});
    }
}

export async function PUT(req) {
    try{
        const {id, amount} = await req.json();
        const connect = await mysql.createConnection(dbConfig);
        console.log("Id: ",id);
        console.log("Amount: ",amount);

        const authHeader = req.headers.get("authorization"); 
        const token = authHeader?.split(" ")[1];

        if (!token) {
            return new Response(JSON.stringify({ message: "Missing token" }), { status: 401 });
        }

        if(!id){
            return NextResponse.json({error: "Missing field"}, {status: 402})
        }
        const [resultCheck] = await connect.execute(
            "SELECT credits, purchase_date, expiration_date FROM account WHERE id = ?", [id]
        );

        if(amount === 1){
            const data = resultCheck[0].credits;
            const number_update = data + 20;
            await connect.execute(
                "UPDATE account set credits = ? WHERE id = ?",[number_update, id]
            );
        }
        else{
            const purchase_date = resultCheck[0].purchase_date;
            const expiration_date = resultCheck[0].expiration_date;
            console.log("purchase_date: ",purchase_date," - expiration_date: ",expiration_date);
            if(amount === 3){
                if(!purchase_date){
                    const now = new Date();
                    const oneMonthLater = new Date(now);
                    oneMonthLater.setMonth(now.getMonth() + 1);
                    await connect.execute(
                        "UPDATE account set purchase_date = ?, expiration_date =? WHERE id = ?",[now, oneMonthLater, id]
                    );
                }
                else{
                    const oneMonthLater = expiration_date;
                    oneMonthLater.setMonth(expiration_date.getMonth() + 1);
                    await connect.execute(
                        "UPDATE account set expiration_date = ? WHERE id = ?",[oneMonthLater, id]
                    );
                }
            }
            else if(amount === 20){
                if(!purchase_date){
                    const now = new Date();
                    const oneYearLater = new Date(now);
                    oneYearLater.setFullYear(now.getFullYear() + 1);
                    await connect.execute(
                        "UPDATE account set purchase_date = ?, expiration_date =? WHERE id = ?",[now, oneYearLater, id]
                    );
                }
                else{
                    const oneYearLater = expiration_date;
                    oneYearLater.setFullYear(expiration_date.getFullYear() + 1);
                    await connect.execute(
                        "UPDATE account set expiration_date = ? WHERE id = ?",[oneYearLater, id]
                    );
                }
            }
        }
        

        await connect.end();

        return NextResponse.json({ status: "success", message: "Update success" }, {status: 200});

    }catch(error){
        console.log("error: ",error);
        return NextResponse.json({ status: "error", message: "Something went wrong", error}, {status: 500});
    }
}