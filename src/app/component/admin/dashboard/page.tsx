"use client";

// import useSWR from "swr";
import styles from "../dashboard/dashboard.module.css";
// import Link from "next/link";
import NavbarUser from "@/app/component/navbar_user/page";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Statistic from "./statistic/page";
import { useTranslations } from "next-intl";
// import { useTranslations } from "next-intl";
// import { useSearchParams } from "next/navigation";

// interface account {
//     id: number;
//     name: string;
//     avatar: string;
//     email: string;
// }

// interface post{
//     post_id: string;
//     title: string;
//     content: string;
//     image: string;
//     audience: string;
//     avatar: string;
//     name: string;
//     platform: string;
// }

// const fetcher = async ([url, type, searchQuery]: [string, string, string | null]) => {
//     const token = Cookies.get("token");
//     if (!token) return [];

//     const queryParam = searchQuery ? `?searchQuery=${encodeURIComponent(searchQuery)}` : "";
    
//     const res = await fetch(`${url}${queryParam}`, {
//         method: "GET",
//         headers: {
//             Authorization: `Bearer ${token}`,
//         }
//     });

//     if (!res.ok) return [];
//     return (await res.json())?.[type] || [];
// };


export default function DashBoard() {
    const [ratePost, setRatePost] = useState("");
    const [rateCredit, setRateCredit] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const token = Cookies.get("token");
            if (!token) return;
    
            try {
                const response = await fetch("/api/admin/statistic_month", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                const result = await response.json(); 
    
                if (result.status === "success") {
                    setRatePost(result.data.rate_post);   
                    setRateCredit(result.data.rate_credit);
                } else {
                    console.error("API Error:", result.message);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            }
        };
    
        fetchData();
    }, []);
    

    // const searchParams = useSearchParams();
    // const searchQuery = searchParams.get("searchQuery") || "";
    const t = useTranslations("dashboard");

    // const { data: users = [] } = useSWR(
    //     ["/api/admin/user", "users", searchQuery],
    //     fetcher
    // );

    // const { data: posts = []} = useSWR(
    //     ["/api/admin/list_post", "posts", searchQuery],
    //     fetcher,
    // );

  return (
    <div className={styles.container}>
            <NavbarUser/>
            <div className={styles.content}>
                <div className={styles.section}>
                    <div className={styles.statistic_month}>
                        { ratePost && (ratePost.startsWith("-") ? <p>{t("rate_post_reduce")}<span className={styles.text_bold}>{ratePost.replace("-","")}</span></p> : <p>{t("rate_post_increase")}<span className={styles.text_bold}>{ratePost}</span></p>)}
                        { rateCredit && (rateCredit.startsWith("-") ? <p>{t("rate_credit_reduce")}<span className={styles.text_bold}>{rateCredit.replace("-","")}</span></p> : <p>{t("rate_credit_increase")}<span className={styles.text_bold}>{rateCredit}</span></p>)}
                    </div>
                    <Statistic/>
                </div>
            </div>
        </div>
  );
}