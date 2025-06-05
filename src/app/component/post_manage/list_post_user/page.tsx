"use client"
import { useState, useEffect } from "react";
import styles from "../list_post_user/list_post_user.module.css";
import { useTranslations } from 'next-intl';
import Cookies from 'js-cookie';
import dynamic from "next/dynamic";
import { Link } from "@mui/material";
import { ToastContainer } from "react-toastify";
import Image from "next/image";

const NavbarComponent = dynamic(() => import("@/app/component/navbar_user/page"));

interface Post {
    id: number;
    title: string;
    content: string;
    image: string;
    posttime: Date;
    platform: string;
    audience: string;
    status: number;
}


function ListPostUser() {
    const t = useTranslations("list_post_user");

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = Cookies.get("token");
        if(!token){
            window.location.href = "/component/account_user/login_user";
        }
    }, []);

    const convertDay = (day: Date | string) => {
        const postDate = new Date(day);
        const currentDate = new Date();
    
        if (isNaN(postDate.getTime())) {
            return "Invalid date";
        }
    
        const diffMs = currentDate.getTime() - postDate.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
        if (postDate.getTime() > currentDate.getTime()) {
            return new Intl.DateTimeFormat('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).format(postDate);
        }
    
        if (diffHours === 0) {
            return `${diffMinutes} ${t("minutes")}`;
        }
    
        if (diffHours < 24) {
            return `${diffHours} ${t("hours")}`;
        }
    
        const diffDays = Math.floor(diffHours / 24);
    
        if (diffDays < 30) {
            return `${diffDays} ${t("days")}`;
        }
    
        const diffMonths = Math.floor(diffDays / 30);
    
        if (diffMonths < 12) {
            return `${diffMonths} ${t("months")}`;
        }
    
        const diffYears = Math.floor(diffDays / 365);
        return `${diffYears} ${t("years")}`;
    };
    
    useEffect(() => {
        const fetchPosts = async () => {
            const token = Cookies.get("token");
            if (!token) {
                setPosts([]);
                return;
            }
            setLoading(true);
            try {
                const response = await fetch("/api/post_manage/list_post_user", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`t("error_http") ${response.status}`);
                }

                const data = await response.json();
                const sortedPosts = data.posts.sort((a: { posttime: string | number | Date; }, b: { posttime: string | number | Date; }
                                    ) => new Date(b.posttime).getTime() - new Date(a.posttime).getTime());
                setPosts(sortedPosts);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return (
        <>
            <NavbarComponent />
            <div className={styles.list_container}>
                <div className={styles.list_post}>
                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            Loading...
                        </div>
                    ) : ( 
                        <>
                        <Link href="/component/post_manage/content_generator" className={styles.btn_create}><p>{t("create_new")}</p></Link> 
                        {posts.length > 0 ? (
                        posts.map((item) => (
                            <div key={item.id} className={styles.item_post}>
                                <div className={styles.mastodon_platform}>
                                        <a href={`/component/post_manage/list_post_user/detail_post/${item.id}`} className={styles.content_post}>
                                            <div className={styles.navbar_item}>
                                                <div className={styles.time_title}>
                                                    <p className={styles.item_title}>{item.title}</p>
                                                    {item.status===1 && <p className={styles.item_time}>{t("posted")} {convertDay(item.posttime)}</p>}
                                                    {item.status===0 && <p className={styles.item_time}>{t("pending")} {convertDay(item.posttime)}</p>}    
                                                </div>
                                                <Image
                                                    src={item.platform === "Mastodon" ? "/icon_mastodon.png" : "/icon_linkedin.webp"}
                                                    alt={item.title}
                                                    width={30}
                                                    height={30}
                                                    className={styles.item_image}
                                                />
                                            </div>
                                            <p className={styles.item_content}>{item.content}</p>
                                        </a>
                                    </div>
                            </div>
                            
                        )
                            )
                         ) : (
                            <p>{t("no_post")}</p>
                            )
                        }</>
                    )}
                </div>
                <ToastContainer/>
            </div>
        </>
    );
}

export default ListPostUser;
