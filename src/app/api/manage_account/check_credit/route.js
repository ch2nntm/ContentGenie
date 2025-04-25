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
        const connection = await mysql.createConnection(dbConfig);
        console.log("Id: ",id);
        const authHeader = req.headers.get("authorization"); 
        const token = authHeader?.split(" ")[1];

        if (!token) {
            return NextResponse.json({ status: "error", message: "Missing token", error }, { status: 401 });
        }

        if(!id){
            return NextResponse.json({ status: "error", message: "Missing field", error}, {status: 402})
        }
        const [result] = await connection.execute(
            "SELECT credits, expiration_date FROM account WHERE id = ?",[id]
        );

        await connection.end();

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
        const {user_id, amount} = await req.json();
        const connection = await mysql.createConnection(dbConfig);
        console.log("user_id: ",user_id);
        console.log("Amount: ",amount);

        const authHeader = req.headers.get("authorization"); 
        const token = authHeader?.split(" ")[1];

        if (!token) {
            return new Response(JSON.stringify({ message: "Missing token" }), { status: 401 });
        }

        if(!user_id){
            return NextResponse.json({error: "Missing field"}, {status: 402})
        }
        const [resultCheck] = await connection.execute(
            "SELECT credits, expiration_date FROM account WHERE id = ?", [user_id]
        );

        if(amount === 1){
            const data = resultCheck[0].credits;
            const number_update = data + 20;
            await connection.execute(
                "UPDATE account set credits = ? WHERE id = ?",[number_update, user_id]
            );
            await connection.execute("INSERT INTO user_upgrade(user_id, package_buy, price, purchase_date) VALUES"
                 +" (?, 'Goi The', ?, ?)", [user_id, amount, new Date()]);
        }
        else{
            const expiration_date = resultCheck[0].expiration_date;
            if(amount === 3){
                const oneMonthLater = expiration_date;
                oneMonthLater.setMonth(expiration_date.getMonth() + 1);
                await connection.execute(
                    "UPDATE account set expiration_date = ? WHERE id = ?",[oneMonthLater, user_id]
                );
                await connection.execute("INSERT INTO user_upgrade(user_id, package_buy, price, purchase_date) VALUES"
                 +" (?, 'Goi Thang', ?, ?)", [user_id, amount, new Date()]);
            }
            else if(amount === 20){
                const oneYearLater = expiration_date;
                oneYearLater.setFullYear(expiration_date.getFullYear() + 1);
                await connection.execute(
                    "UPDATE account set expiration_date = ? WHERE id = ?",[oneYearLater, user_id]
                );
                await connection.execute("INSERT INTO user_upgrade(user_id, package_buy, price, purchase_date) VALUES"
                 +" (?, 'Goi Nam', ?, ?)", [user_id, amount, new Date()]);
            }
        }
        

        await connection.end();

        return NextResponse.json({ status: "success", message: "Update success" }, {status: 200});

    }catch(error){
        console.log("error: ",error);
        return NextResponse.json({ status: "error", message: "Something went wrong", error}, {status: 500});
    }
}