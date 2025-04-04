"use client";

import useSWR from "swr";
import styles from "../../../styles/dashboard.module.css";
import Link from "next/link";
import NavbarUser from "@/single_file/navbar_user";
import SearchIcon from "@mui/icons-material/Search";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import MarkAsUnreadIcon from "@mui/icons-material/MarkAsUnread";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SettingsIcon from "@mui/icons-material/Settings";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";

interface account {
    id: number;
    name: string;
    avatar: string;
    email: string;
}

interface post{
    post_id: string;
    title: string;
    content: string;
    image: string;
    audience: string;
    avatar: string;
    name: string;
    platform: string;
}

const fetcher = async ([url, type]: [string, string]) => {
    const token = Cookies.get("token");
  if (!token) return [];

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return [];
  return (await res.json())?.[type] || [];
};

export default function DashBoard() {
  const { data: users = []} = useSWR(
    ["http://localhost:3000/api/manage_account/user", "users"],
    fetcher,
  );

  const { data: posts = []} = useSWR(
    ["http://localhost:3000/api/manage_account/list_post", "posts"],
    fetcher,
  );

  const t = useTranslations("dashboard");

  return (
    <div className={styles.container}>
            <NavbarUser />
            <div className={styles.content}>
                <div className={styles.sidebar}>
                    <div className={styles.dashboard}>
                        <div className={styles.icon_dashboard}>
                            <SearchIcon></SearchIcon>
                        </div>
                        <p className={styles.text_dashboard}>{t("sidebar_dashboard")}</p>
                    </div>
                    <div className={styles.users}>
                        <div className={styles.icon_users}>
                            <PeopleAltIcon></PeopleAltIcon>
                        </div>
                        <p className={styles.text_users}>{t("sidebar_users")}</p>
                    </div>
                    <div className={styles.posts}>
                        <div className={styles.icon_posts}>
                            <MarkAsUnreadIcon></MarkAsUnreadIcon>
                        </div>
                        <p className={styles.text_posts}>{t("sidebar_posts")}</p>
                    </div>
                    <div className={styles.analytics}>
                        <div className={styles.icon_analytics}>
                            <TrendingUpIcon></TrendingUpIcon>
                        </div>
                        <p className={styles.text_analytics}>{t("sidebar_analytics")}</p>
                    </div>
                    <div className={styles.settings}>
                        <div className={styles.icon_settings}>
                            <SettingsIcon></SettingsIcon>
                        </div>
                        <p className={styles.text_settings}>{t("sidebar_settings")}</p>
                    </div>
                </div>
                <div className={styles.section}>
                    <div className={styles.user_management}>
                        <div className={styles.content_user_management}>
                            {/* <Link href="/component/admin/new_user" className={styles.btn_add_new}>
                                {t("section_add_new_user")}
                            </Link> */}
                            <p className={styles.text_user_management}>{t("section_user_management")}</p>
                            <div className={styles.item_user_management}>
                                {users.length > 0 ? (
                                    users.map((item: account) => (
                                        <div key={item.id} className={styles.item_user}>
                                            <Link href={`/component/admin/dashboard/user/${item.id}`} className={styles.inf_user}>
                                                <div className={styles.avt_user_container}>
                                                    <img className={styles.avt_user} src={item.avatar ? item.avatar : "/icon_circle_user.png"}></img>
                                                </div>
                                                <p className={styles.item_name_user}>{item.name}</p>
                                            </Link>
                                            <p className={styles.item_email_user}>@{item.email}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>{t("section_no_user")}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={styles.user_management}>
                        <div className={styles.content_user_management}>
                            {/* <Link href="/component/admin/new_user" className={styles.btn_add_new}>
                                {t("section_add_new_post")}
                            </Link> */}
                            <p className={styles.text_user_management}>{t("section_list_post")}</p>
                            <div className={styles.item_user_management}>
                                {posts.length > 0 ? (
                                    posts.map((item: post) => (
                                        <div key={item.post_id} className={styles.item_user}>
                                            <Link href={`/component/admin/dashboard/post/${item.post_id}`} className={styles.item_user}>
                                                <div className={styles.inf_user}>
                                                    <div className={styles.avt_user_container}>
                                                        <img className={styles.avt_user} src={item.avatar ? item.avatar : "/icon_circle_user.png"}></img>
                                                    </div>
                                                    <p className={styles.item_name_user}>{item.name}</p>
                                                </div>
                                                <div className={styles.content_post}>
                                                    <div className={styles.gene_post}>
                                                        <p className={styles.text_title}>{item.title}</p>
                                                        {item.platform === "Mastodon" && <img className={styles.icon_platform} src="/icon_mastodon.png"/>}
                                                        {item.platform === "LinkedIn" && <img className={styles.icon_platform} src="/icon_linkedin.webp"/>}
                                                    </div>
                                                    <p className={styles.text_content}>{item.content}</p>
                                                </div>
                                            </Link>
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
  );
}
