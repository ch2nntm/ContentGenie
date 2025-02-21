"use client";
import { useEffect, useState } from "react";
import styles from "../../../styles/dashboard.module.css";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Cookies from "js-cookie";
import NavbarUser from "@/single_file/navbar_user";

function DashBoard(){

    // const [inputSearch, setInputSearch] = useState("");
    const t = useTranslations("dashboard");

    const [users, setUsers] = useState<AccountUser[]>([]);

    useEffect(() => {
        const token = Cookies.get("token");
        if(token){
            fetch("/api/manage_account/user", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => res.json())
            .then((data) => {
                console.log("Data from API:", data);
                setUsers(data?.users || []); 
            })
            .catch((err) => console.error("Error fetching users:", err));
        }
    }, []);

    return (
        <div className={styles.container}>
            {/* <div className={styles.navbar}>
                <div className={styles.title_logo}>
                    <div className={styles.icon_logo}>
                        <Image src="/wand_magic_sparkles.png" alt="logo" fill ></Image>
                    </div>
                    <h1 className={styles.title_navbar}>ContentGenie</h1>
                </div>
                <div className={styles.search}>
                    <input className={styles.input_search} type="text" placeholder={t("input_search")} value={inputSearch} onChange={(e) => setInputSearch(e.target.value)}/>
                </div>
                <div className={styles.icon_navbar}>
                        <button className={styles.icon_bell}>
                            <Image src="/icon_bell.png" alt="Noti" fill ></Image>
                        </button>
                        <button className={styles.button_user}>
                            <div className={styles.icon_user}>
                                <Image src="/icon_circle_user.png" alt="User" fill ></Image>
                            </div>
                        </button>
                    </div>
            </div> */}
            <NavbarUser></NavbarUser>
            <div className={styles.content}>
                <div className={styles.sidebar}>
                    <div className={styles.dashboard}>
                        <div className={styles.icon_dashboard}>
                            <Image src="/icon_sidebar_dashboard.png" alt="Icon dashboard" fill></Image>
                        </div>
                        <p className={styles.text_dashboard}>{t("sidebar_dashboard")}</p>
                    </div>
                    <div className={styles.users}>
                        <div className={styles.icon_users}>
                            <Image src="/icon_sidebar_users.png" alt="Icon users" fill></Image>
                        </div>
                        <p className={styles.text_users}>{t("sidebar_users")}</p>
                    </div>
                    <div className={styles.posts}>
                        <div className={styles.icon_posts}>
                            <Image src="/icon_sidebar_posts.png" alt="Icon posts" fill></Image>
                        </div>
                        <p className={styles.text_posts}>{t("sidebar_posts")}</p>
                    </div>
                    <div className={styles.analytics}>
                        <div className={styles.icon_analytics}>
                            <Image src="/icon_sidebar_analytics.png" alt="Icon analytics" fill></Image>
                        </div>
                        <p className={styles.text_analytics}>{t("sidebar_analytics")}</p>
                    </div>
                    <div className={styles.settings}>
                        <div className={styles.icon_settings}>
                            <Image src="/icon_sidebar_settings.png" alt="Icon settings" fill></Image>
                        </div>
                        <p className={styles.text_settings}>{t("sidebar_settings")}</p>
                    </div>
                </div>
                <div className={styles.section}>
                    <div className={styles.user_management}>
                        <p className={styles.text_user_management}>{t("section_user_management")}</p>
                        <div className={styles.content_user_management}>
                            <button className={styles.btn_add_new}>
                                {t("section_add_new_user")}
                            </button>
                            <div className={styles.item_user_management}>
                                {users.length > 0 ? (
                                    users.map((item) => (
                                        <div key={item.id} className={styles.item_user}>
                                            <p className={styles.item_name_user}>{item.name}</p>
                                            <Link href={`dashboard/user/${item.id}`} className={styles.btn_edit_user}>{t("section_edit")}</Link>
                                        </div>
                                    ))
                                ) : (
                                    <p>{t("section_no_user")}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashBoard;