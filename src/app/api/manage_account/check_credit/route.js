import mysql from "mysql2/promise";
import { NextResponse } from "next/server";
import dbConfig from "../../../../../dbConfig.js";

export async function POST(req) {
    try{
        const {id} = await req.json();
        const connection = await mysql.createConnection(dbConfig);
        console.log("Id: ",id);
        const authHeader = req.headers.get("authorization"); 
        const token = authHeader?.split(" ")[1];

        if (!token) {
            return NextResponse.json({ status: "error", message: "Missing token" }, { status: 401 });
        }

        if(!id){
            return NextResponse.json({ status: "error", message: "Missing field" }, {status: 402})
        }
        const [result] = await connection.execute(
            "SELECT credits, expiration_date FROM account WHERE id = ?",[id]
        );

        await connection.end();

        if(result.length === 0){
            return NextResponse.json({ status: "error", message: "Credits of user isn't exist"}, {status: 400});
        }
        return NextResponse.json({ status: "success", message: "Check credits success", data: result}, {status: 200});

    }catch(error){
        return NextResponse.json({ status: "error", message: error}, {status: 500});
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
            return NextResponse.json({ status: "error", message: "Missing token" }, { status: 401 });
        }

        if(!user_id){
            return NextResponse.json({ status: "error", message: "Missing field" }, { status: 402 });
        }
        const [resultCheck] = await connection.execute(
            "SELECT credits, expiration_date FROM account WHERE id = ?", [user_id]
        );

        if(amount === 10000){
            const data = resultCheck[0].credits;
            const number_update = data + 20;
            await connection.execute(
                "UPDATE account set credits = ? WHERE id = ?",[number_update, user_id]
            );
            await connection.execute("INSERT INTO user_upgrade(user_id, package_buy, price, purchase_date) VALUES"
                 +" (?, 'Goi The', ?, ?)", [user_id, amount, new Date()]);

            await connection.end();
            return NextResponse.json({ status: "success", message: "Update package credit success" }, { status: 200 });
        }
        else{
            const expiration_date = new Date(resultCheck[0].expiration_date);
            if(amount === 1){
                let oneMonthLater;
                const now = new Date();
                if(expiration_date < now){
                    oneMonthLater = new Date(now);
                    oneMonthLater.setMonth(now.getMonth() + 1);
                }
                else{
                    oneMonthLater = new Date(expiration_date);
                    oneMonthLater.setMonth(expiration_date.getMonth() + 1);
                }
                await connection.execute(
                    "UPDATE account set expiration_date = ? WHERE id = ?",[oneMonthLater, user_id]
                );
                await connection.execute("INSERT INTO user_upgrade(user_id, package_buy, price, purchase_date) VALUES"
                 +" (?, 'Goi Thang', ?, ?)", [user_id, amount, now]);

                await connection.end();
                return NextResponse.json({ status: "success", message: "Update package month success" }, { status: 200 });
            }
            else if(amount === 250000){
                let oneYearLater;
                const now = new Date();
                if(expiration_date < now){
                    oneYearLater = new Date(now);
                    oneYearLater.setFullYear(now.getFullYear() + 1);
                }
                else{
                    oneYearLater = new Date(expiration_date);
                    oneYearLater.setFullYear(expiration_date.getFullYear() + 1);
                }
                
                await connection.execute(
                    "UPDATE account set expiration_date = ? WHERE id = ?",[oneYearLater, user_id]
                );
                await connection.execute("INSERT INTO user_upgrade(user_id, package_buy, price, purchase_date) VALUES"
                 +" (?, 'Goi Nam', ?, ?)", [user_id, amount, now]);

                await connection.end();
                return NextResponse.json({ status: "success", message: "Update package year success" }, { status: 200 });
            }
            else{
                await connection.end();
                return NextResponse.json({ status: "error", message: "Invalid amount" }, { status: 500 });
            }
        }
    }catch(error){
        console.log("error: ",error);
        return NextResponse.json({ status: "error", message: error }, { status: 500 });
    }
}