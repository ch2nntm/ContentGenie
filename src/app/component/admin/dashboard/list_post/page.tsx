"use client"
import styles from "../list_post/list_post_dashboard.module.css";
import { useTranslations } from "next-intl";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PanToolAltOutlinedIcon from '@mui/icons-material/PanToolAltOutlined';
import Link from "next/link";
import Image from "next/image";
import NavbarUser from "@/app/component/navbar_user/page";

interface post{
    post_id: string;
    title: string;
    content: string;
    image: string;
    posttime: Date;
    audience: string;
    avatar: string;
    name: string;
    platform: string;
}

function ListPostDashboard() {
    const t = useTranslations("list_post_dashboard");
    const [data, setData] = useState<post[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedWeek, setSelectedWeek] = useState<number>(new Date().getDate() / 7);

    useEffect(() => {
        const fetchData = async () => {
            const token = Cookies.get("token");
            if(!token){
                window.location.href = "/component/account_user/login_user";
            }
            try {
                const res = await fetch("/api/admin/list_post", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({year: selectedYear, month: selectedMonth, week: selectedWeek})
                });

                const dataResponse = await res.json();
                setData(dataResponse.posts);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [selectedYear, selectedMonth, selectedWeek]);

    const groupPostsByWeekday = (posts: post[]) => {
        const grouped: { [key: number]: post[] } = {
            0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
        };

        posts.forEach((post) => {
            const createdAt = new Date(post.posttime);
            const dayOfWeek = createdAt.getDay();
            if (grouped[dayOfWeek]) {
                grouped[dayOfWeek].push(post);
            }
        });

        return grouped;
    };

    const groupedPosts = groupPostsByWeekday(data);

    return (
        <div className={styles.container}>
            <NavbarUser/>
            <div className={styles.content}>
                {/* <div className={styles.sidebar}>
                    <Link href="/component/admin/dashboard" className={styles.dashboard}>
                        <div className={styles.icon_dashboard}>
                            <SearchIcon></SearchIcon>
                        </div>
                        <p className={styles.text_dashboard}>{t("sidebar_dashboard")}</p>
                    </Link>
                    <Link href="/component/admin/dashboard/list_user" className={styles.users}>
                        <div className={styles.icon_users}>
                            <PeopleAltIcon></PeopleAltIcon>
                        </div>
                        <p className={styles.text_users}>{t("sidebar_users")}</p>
                    </Link>
                    <div className={styles.posts}>
                        <div className={styles.icon_posts}>
                            <MarkAsUnreadIcon></MarkAsUnreadIcon>
                        </div>
                        <div className={styles.container_text_post}>
                            <p className={styles.text_posts}>{t("sidebar_posts")}</p>
                        </div>
                    </div>
                    <Link href="/component/admin/dashboard/statistic" className={styles.analytics}>
                        <div className={styles.icon_analytics}>
                            <TrendingUpIcon></TrendingUpIcon>
                        </div>
                        <p className={styles.text_analytics}>{t("sidebar_analytics")}</p>
                    </Link>
                </div> */}
                <div className={styles.section}>
                    <div className={styles.btn_time_group}>
                        <select className={styles.select_year} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                            {Array.from({ length: 10 }, (_, i) => 2020 + i).map((year) => (
                                <option key={year} value={year}>{t("year")} {year}</option>
                            ))}
                        </select>
                        <select className={styles.select_month} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                <option key={month} value={month}>{t("month")} {month}</option>
                            ))}
                        </select>
                        <select className={styles.select_week} onChange={(e) => setSelectedWeek(Number(e.target.value))}>
                            {Array.from({ length: 5 }, (_, i) => i + 1).map((week) => (
                                <option key={week} value={week}>{t("week")} {week}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.content_section}>
                        <Table className={styles.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell key={0} align="center" className={styles.tablecell}>{t("sunday")}</TableCell>
                                    <TableCell key={1} align="center" className={styles.tablecell}>{t("monday")}</TableCell>
                                    <TableCell key={2} align="center" className={styles.tablecell}>{t("tuesday")}</TableCell>
                                    <TableCell key={3} align="center" className={styles.tablecell}>{t("wednesday")}</TableCell>
                                    <TableCell key={4} align="center" className={styles.tablecell}>{t("thursday")}</TableCell>
                                    <TableCell key={5} align="center" className={styles.tablecell}>{t("friday")}</TableCell>
                                    <TableCell key={6} align="center" className={styles.tablecell}>{t("saturday")}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow className={styles.scrollable_container}>
                                    {Object.keys(groupedPosts).map((key) => (
                                        <TableCell key={key} align="center">
                                            <div className={styles.scrollable_container}>
                                                {groupedPosts[parseInt(key)].map((post) => (
                                                    <>
                                                        <div key={post.post_id} className={styles.item_post}>
                                                            <div className={styles.item_time}>
                                                                <AccessTimeIcon/>
                                                                <p key={post.post_id}>{new Date(post.posttime).getHours()}: {new Date(post.posttime).getMinutes() < 10 ? "0" + new Date(post.posttime).getMinutes() : new Date(post.posttime).getMinutes()}</p>
                                                            </div>
                                                            {post.image && 
                                                            !post.image.includes(process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "") && 
                                                            !post.image.includes(process.env.NEXT_PUBLIC_SPOTIFY_URL ?? "") && (
                                                                <Image src={post.image} className={styles.item_image} width={50} height={50} alt="Post image" />
                                                            )}

                                                            {post.image && 
                                                            post.image.includes(process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "") && (
                                                                <iframe className={styles.item_image} src={post.image} title="YouTube video"></iframe>
                                                            )}

                                                            {post.image && 
                                                            post.image.includes(process.env.NEXT_PUBLIC_SPOTIFY_URL ?? "") && (
                                                                <div className={styles.inf_spotify}>
                                                                    <Image src="/icon_spotify.png" width={20} height={20} alt="Icon Spotify" />
                                                                    <p>Spotify</p>
                                                                </div>
                                                            )}

                                                            <p className={post.image ? styles.item_content_img : styles.item_content}>{post.content}</p>
                                                            <div className={styles.footer}>
                                                                <Link href={`/component/admin/dashboard/post/${post.post_id}`} className={styles.btn_detail}>
                                                                    <p>{t("detail")}</p>
                                                                    <PanToolAltOutlinedIcon/>
                                                                </Link>
                                                                {post.platform === "Mastodon" && <img className={styles.icon_platform} src="/icon_mastodon.png"/>}
                                                                {post.platform === "LinkedIn" && <img className={styles.icon_platform} src="/icon_linkedin.webp"/>}
                                                            </div>
                                                        </div>
                                                    </>
                                                ))}
                                            </div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ListPostDashboard;