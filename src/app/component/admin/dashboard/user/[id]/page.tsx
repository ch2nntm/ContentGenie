"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";


const ViewUserDetail = () => {
    const params = useParams();
    const id = params.id as string;

    const [detailUser, setDetailUser] = useState<AccountUser | null>(null);
    useEffect(() => {
        fetch(`/api/manage_account/user/${id}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        })
        .then((res) => res.json())
        .then((data) => {
            console.log("Data from API:", data);
            setDetailUser(data || null);
        })
        .catch((err) => console.error("Error fetching user:", err));
    }, []);

    return (
        <div>
            <h1>Thông tin người dùng {id}!</h1>
            {detailUser ? (
                <>
                    <p>Họ tên: {detailUser.name}</p>
                </>
            ) : (
                <p>Không tìm thấy người dùng.</p>
            )}
        </div>
    );

}

export default ViewUserDetail;