"use client"
import NavbarUser from "@/components/navbar_user";
import styles from "../list_user/list_user_dashboard.module.css"
import Link from "next/link";
import SearchIcon from "@mui/icons-material/Search";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import MarkAsUnreadIcon from "@mui/icons-material/MarkAsUnread";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SettingsIcon from "@mui/icons-material/Settings";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

interface account{
    avatar: string;
    count_post: number;
    credits: number;
    email: string;
    id: number;
    name: string;
    password: string;
    role: number;
}

function ListUserDashboard() {
    const t = useTranslations("list_user_dashboard");
    const [users, setUsers] = useState<account[]>([]);
    const [loading, setLoading] = useState(false); 

    useEffect(()=>{
        const fetchData = async () => {
            const token = Cookies.get("token");
            if(!token){
                window.location.href = "/component/account_user/login_user";
            }
            setLoading(true);
            try{
                const response = await fetch("/api/manage_account/user",{
                    method: "GET",
                    headers:{
                        "Authorization": `Bearer: ${token}`
                    }
                });
                const dataResponse = await response.json();
                const data = dataResponse.users;
                setUsers(data);
                console.log("data: ",data);
            }
            catch(error){
                console.log(error);
            }
            finally {
                setLoading(false); 
            }
        }
        fetchData();
    },[])
    
    return(
        <div className={styles.container}>
            <NavbarUser/>
            <div className={styles.content}>
                <div className={styles.sidebar}>
                    <Link href="/component/admin/dashboard" className={styles.dashboard}>
                        <div className={styles.icon_dashboard}>
                            <SearchIcon></SearchIcon>
                        </div>
                        <p className={styles.text_dashboard}>{t("sidebar_dashboard")}</p>
                    </Link>
                    <div className={styles.users}>
                        <div className={styles.icon_users}>
                            <PeopleAltIcon></PeopleAltIcon>
                        </div>
                        <div className={styles.container_text_users}>
                            <p className={styles.text_users}>{t("sidebar_users")}</p>
                        </div>
                    </div>
                    <Link href="/component/admin/dashboard/list_post" className={styles.posts}>
                        <div className={styles.icon_posts}>
                            <MarkAsUnreadIcon></MarkAsUnreadIcon>
                        </div>
                        <p className={styles.text_posts}>{t("sidebar_posts")}</p>
                    </Link>
                    <Link href="/component/admin/dashboard/statistic" className={styles.analytics}>
                        <div className={styles.icon_analytics}>
                            <TrendingUpIcon></TrendingUpIcon>
                        </div>
                        <p className={styles.text_analytics}>{t("sidebar_analytics")}</p>
                    </Link>
                    <div className={styles.settings}>
                        <div className={styles.icon_settings}>
                            <SettingsIcon></SettingsIcon>
                        </div>
                        <p className={styles.text_settings}>{t("sidebar_settings")}</p>
                    </div>
                </div>
                <div className={styles.section}>
                    <div className={styles.item_user_management}>
                        {loading ? (
                            <div className={styles.loading}>
                                <div className={styles.spinner}></div>
                                Loading...
                            </div>
                        ) : 
                            users.length > 0 ? (
                                users.map((item: account) => (
                                    <div key={item.id} className={styles.item_user}>
                                        <Link href={`/component/admin/dashboard/user/${item.id}`} className={styles.inf_user}>
                                            <div className={styles.avt_user_container}>
                                                <img className={styles.avt_user} src={item.avatar ? item.avatar : "/icon_circle_user.png"}></img>
                                            </div>
                                            <p className={styles.item_name_user}>{item.name}</p>
                                        </Link>
                                        <p className={styles.item_email_user}>@{item.email}</p>
                                        <p className={styles.item_credit_user}>So luong the con lai: {item.credits}</p>
                                        <p className={styles.item_post_of_user}>So bai dang: {item.count_post}</p>
                                    </div>
                                ))
                            )
                            : (
                                null
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ListUserDashboard