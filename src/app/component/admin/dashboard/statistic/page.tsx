"use client"

import styles from "../../../../styles/statistic.module.css"
import SearchIcon from "@mui/icons-material/Search";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import MarkAsUnreadIcon from "@mui/icons-material/MarkAsUnread";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SettingsIcon from "@mui/icons-material/Settings";
import NavbarUser from "@/single_file/navbar_user";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import html2pdf from "html2pdf.js";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface statistic {
    month: number;
    total_posts: number;
    total_credits: number;
}

function Statistic() {

    const t = useTranslations("statistics");
    const [selectedYear, setSelectedYear] = useState("2020");
    const [data, setData] = useState<statistic[]> ([]);
    const [labels, setLabels] = useState<string[]> ([]);
    const [totalPosts, setTotalPosts] = useState<number[]> ([]);
    const [totalCredits, setTotalCredits] = useState<number[]> ([]);
    const listLabels: string[] = [];
    const listPost: number[] = [];
    const listCredit: number[] = [];
    
    const fetchData = async() => {
        try{
            const token = Cookies.get("token");
            if(!token){
                console.error("Missing token");
            }
            const response = await fetch("http://localhost:3000/api/admin/statistic",{
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({year: selectedYear})
            });
            const data = await response.json();
            setData(data.posts);
            listLabels.length = 0;
            for(let i=0; i<=11; i++){
                listLabels.push(`${t("month")} ${i+1}`);
                listPost.push(data.posts[i].total_posts);
                listCredit.push(data.posts[i].total_credits)
            }
            setLabels(listLabels);
            setTotalPosts(listPost);
            setTotalCredits(listCredit);

            console.log("Data: ",data.posts);
        }catch(error){
            console.log(error);
        }
    }
    useEffect(()=>{
        fetchData();
    },[selectedYear])

    useEffect(() => {
        console.log("DATA Updated: ", data);
    }, [data]); 
    
    const slidesRef = useRef<HTMLDivElement | null>(null);
    const handleGeneratePdf = () => {
        const opt = {
            margin: 1,
            filename: `statistics_${selectedYear}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
        };
        if (slidesRef.current) {
            html2pdf().from(slidesRef.current).set(opt).save();
        }
    };
    
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
                    <Link href="/component/admin/dashboard/list_user" className={styles.users}>
                        <div className={styles.icon_users}>
                            <PeopleAltIcon></PeopleAltIcon>
                        </div>
                        <p className={styles.text_users}>{t("sidebar_users")}</p>
                    </Link>
                    <Link href="/component/admin/dashboard/list_post" className={styles.posts}>
                        <div className={styles.icon_posts}>
                            <MarkAsUnreadIcon></MarkAsUnreadIcon>
                        </div>
                        <p className={styles.text_posts}>{t("sidebar_posts")}</p>
                    </Link>
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
                    <p className={styles.title_page}>
                        {t("title_page")}
                    </p>
                    <div className={styles.time}>
                        <label htmlFor="year">{t("label_year")}</label>
                        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className={styles.select_time}>
                        {[...Array(26 - 0)].map((_, i) => (
                            <option key={i} value={2020 + i}>{2020 + i}</option>
                        ))}
                        </select>
                        <button className={styles.btn_export} type="button" onClick={() => handleGeneratePdf()}>{t("export_pdf")}</button>
                    </div>
                    <div className={styles.statistic} ref={slidesRef}>
                            <Bar className={styles.table_statistic} data={{
                                labels: labels,
                                datasets: [
                                    {
                                        label: t("label_post"),
                                        backgroundColor: ["#3e95cd"],
                                        data: totalPosts,
                                    },
                                    {
                                        label: t("label_credit"),
                                        backgroundColor: ["#c13ecd"],
                                        data: totalCredits,
                                    },
                                ],
                            }}
                              
                              options = {{
                                plugins: {
                                    legend: {
                                        display: true
                                    },
                                    title: {
                                        display: true,
                                        text: t("title_statistic"),
                                        position: "bottom",
                                        font: {
                                            size: 24
                                        }
                                    },
                                },
                            }}
                        />
                        <canvas height="363" width="726" className="chartjs-render-monitor" style={{ display: "block", width: "726px", height: "363px" }}></canvas>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Statistic;