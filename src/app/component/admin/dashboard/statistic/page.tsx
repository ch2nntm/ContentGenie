"use client"

import styles from "../statistic/statistic.module.css"
import NavbarUser from "@/app/component/navbar_user/page";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import html2pdf from "html2pdf.js";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface statistic {
    month: number;
    year: number;
    total_posts_paiding: number;
    total_posts_posted: number;
    total_credits: number;
}

function Statistic() {

    const t = useTranslations("statistics");
    const [selectedYear, setSelectedYear] = useState((new Date().getFullYear()).toString());
    const [dataStatistics, setDataStatistic] = useState<statistic[]> ([]);
    const [list, setList] = useState<statistic[]> ([]);
    const [isClickList, setIsClickList] = useState(false);
    const [labels, setLabels] = useState<string[]> ([]);
    const [totalPostsPaiding, setTotalPostsPaiding] = useState<number[]> ([]);
    const [totalPostsPosted, setTotalPostsPosted] = useState<number[]> ([]);
    const [totalCredits, setTotalCredits] = useState<number[]> ([]);
    const listLabels: string[] = [];
    const listPostPaiding: number[] = [];
    const listPostPosted: number[] = [];
    const listCredit: number[] = [];
    const [loading, isLoading] = useState(false);
    
    const fetchData = async() => {
        try{
            const token = Cookies.get("token");
            if(!token){
                window.location.href = "/component/account_user/login_user";
            }
            const response = await fetch("/api/admin/statistic",{
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({year: selectedYear})
            });
            const data = await response.json();
            setDataStatistic(data.posts);
            listLabels.length = 0;
            for(let i=0; i<=11; i++){
                listLabels.push(`${t("month")} ${i+1}`);
                listPostPaiding.push(data.posts[i].total_posts_paiding);
                listPostPosted.push(data.posts[i].total_posts_posted);
                listCredit.push(data.posts[i].total_credits)
            }
            setLabels(listLabels);
            setTotalPostsPaiding(listPostPaiding);
            setTotalPostsPosted(listPostPosted);
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
        console.log("DATA Updated: ", dataStatistics);
    }, [dataStatistics]); 
    
    const slidesRef = useRef<HTMLDivElement | null>(null);
    const handleGeneratePdf = () => {
        const opt = {
            margin: 1,
            filename: `statistics_list.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
        };
        if (slidesRef.current) {
            html2pdf().from(slidesRef.current).set(opt).save();
        }
    };

    const handleList = async () => {
        const token = Cookies.get("token");
        if (!token) {
            return;
        }
        setIsClickList(true);
        isLoading(true);
        const response = await fetch("/api/admin/statistic", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).finally(() => {
            isLoading(false);
        });
        if(!response.ok){
            return;
        }
        const data = await response.json();
        console.log("data.posts: ",data.data);
        setList(data.data);
    }

    const before10Year = new Date().getFullYear() - 10;
    
    return(
        <div className={styles.container}>
            <NavbarUser/>
            <div className={styles.content}>
                <div className={styles.section}>
                    <p className={styles.title_page}>
                        {t("title_page")}
                    </p>
                    <div className={styles.time}>
                        <label htmlFor="year">{t("label_year")}</label>
                        <select value={selectedYear} onChange={(e) => { setSelectedYear(e.target.value); setIsClickList(false); }} className={styles.select_time}>
                        {[...Array(11)].map((_, i) => (
                            <option key={i} value={before10Year + i}>{before10Year + i}</option>
                        ))}
                        </select>
                        { isClickList === true && <button className={styles.btn_export} type="button" onClick={() => handleGeneratePdf()}>{t("export_pdf")}</button>}
                        <button className={styles.btn_export_list} type="button" onClick={() => handleList()}>{t("btn_list_statistics")}</button>
                    </div>
                    { isClickList === false && <div className={styles.statistic}>
                        <Bar className={styles.table_statistic} data={{
                            labels: labels,
                            datasets: [
                                {
                                    label: t("label_post_pending"),
                                    backgroundColor: ["#3e95cd"],
                                    data: totalPostsPaiding,
                                },
                                {
                                    label: t("label_post_posted"),
                                    backgroundColor: ["#66cd3e"],
                                    data: totalPostsPosted,
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
                                legend: { // Note
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
                        {/* <canvas height="363" width="726" className="chartjs-render-monitor" style={{ display: "block", width: "726px", height: "363px" }}></canvas> */}
                    </div>
                    }
                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            Loading...
                        </div>
                        ) : (
                            <>{ isClickList === true && 
                            <div ref={slidesRef} className={styles.list_statistics}>
                                <p className={styles.title_list_statistics}>{t("title_list_statistics")}</p>
                                <table className={styles.table_list}>
                                    <thead>
                                        <tr className={styles.tablerow}>
                                        <td className={styles.title_tablecell}>{t("lable_time")}</td>
                                        <td className={styles.title_tablecell}>{t("label_post_pending")}</td>
                                        <td className={styles.title_tablecell}>{t("label_post_posted")}</td>
                                        <td className={styles.title_tablecell}>{t("label_credit")}</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...list]
                                            .sort((a, b) => {
                                            if (a.year !== b.year) return b.year - a.year;
                                            return b.month - a.month; 
                                            })
                                            .map((item: statistic, index: number) => (
                                            <tr key={index} className={styles.tablerow}>
                                                <td className={styles.tablecell}>{item.month} - {item.year}</td>
                                                <td className={styles.tablecell}>{item.total_posts_paiding}</td>
                                                <td className={styles.tablecell}>{item.total_posts_posted}</td>
                                                <td className={styles.tablecell}>{item.total_credits}</td>
                                            </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        }</>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Statistic;