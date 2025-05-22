"use client"
import { useState, useEffect } from "react";
import styles from "../list_post_user/list_post_user.module.css";
import { useTranslations } from 'next-intl';
import Cookies from 'js-cookie';
import dynamic from "next/dynamic";
import { Link } from "@mui/material";
import { ToastContainer } from "react-toastify";

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

    const convertDay = (day: Date) => {
        const postDate = new Date(day);
        const currentDate = new Date();
        const timeDiff = Math.abs(currentDate.getTime() - postDate.getTime());
        const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60));

        if(postDate.getTime() > currentDate.getTime())
            return `${postDate.getDate()}-${postDate.getMonth()+1}-${postDate.getFullYear()}`;
        if(daysAgo===0){
            return `${Math.floor(timeDiff / (1000 * 60))} ${t("minutes")}`;
        }
        if(daysAgo<24)
            return `${daysAgo} ${t("hours")}`;
        else if(daysAgo<720){
            return `${Math.floor(daysAgo/24)} ${t("days")}`;
        }
        else{
            if(daysAgo>720 && daysAgo<8760){
                const monthsAgo = Math.floor(daysAgo/720);
                return `${monthsAgo} ${t("months")}`;
            }
            else{
                const monthsAgo = Math.floor(daysAgo/8760);
                return `${monthsAgo} ${t("years")}`;
            }
        } 
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
                                    <div>
                                        <div className={styles.navbar_user}>
                                        </div>
                                        <a href={`/component/post_manage/list_post_user/detail_post/${item.id}`} className={styles.content_post}>
                                            <p className={styles.item_title}>{item.title}</p>
                                            {item.status===1 && <p className={styles.item_time}>{t("posted")} {convertDay(item.posttime)}</p>}
                                            {item.status===0 && <p className={styles.item_time}>{t("pending")} {convertDay(item.posttime)}</p>}
                                            <p className={styles.item_content}>{item.content}</p>
                                        </a>
                                    </div>
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
