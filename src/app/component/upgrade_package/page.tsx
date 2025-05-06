"use client"
import styles from "../upgrade_package/upgrade_package.module.css";
import NavbarUser from "@/app/component/navbar_user/page";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast, ToastContainer } from "react-toastify";
import { CheckCircle } from "@mui/icons-material";
import AddCardIcon from '@mui/icons-material/AddCard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';


export default function UpgradePackagePage(){
    const [userId, setUserId] = useState(0);
    const [credits, setCredits] = useState(0);
    const [expirationDate, setExpirationDate] = useState("");
    const [linkCurrent, setLinkCurrent] = useState("check");
    const searchParams = useSearchParams();
    const code = searchParams.get("code") || "";
    const status = searchParams.get("status") || "";
    const orderCode = searchParams.get("orderCode") || "";
    const t = useTranslations("upgrade_package");
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const fetchData = async() => {
            try{
                const token = Cookies.get("token");
                if(!token){
                    window.location.href = "/component/account_user/login_user";
                }
                else{
                    fetch("/api/manage_account/login", {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })
                    .then(async (res) => {
                        if (!res) {
                            throw new Error(`Lỗi HTTP: ${res}`);
                        }
                        const contentType = res.headers.get("content-type");
                        if (!contentType || !contentType.includes("application/json")) {
                            throw new Error("Phản hồi không phải JSON hợp lệ");
                        }
                        return res.json();
                    })
                    .then(async (data) => {
                        if (data.user) {
                            setUserId(data.user.id);
                            console.log("userId: ",data.user.id);
                            if(code==="00" && status==="PAID"){
                                const getCode = await fetch(`/api/payos?id=${orderCode}`,{
                                    method: "GET"
                                })
                                const resCode = await getCode.json();
                                const statusCode = resCode.data.data.status;
                                const amount = resCode.data.data.amount;
                                console.log("statusCode: ",statusCode);
                                console.log("amount: ",amount);
                                if(statusCode === "PAID"){
                                    const putRes = await fetch("/api/manage_account/check_credit", {
                                        method: "PUT",
                                        headers: {
                                        "Authorization": `Bearer ${token}`,
                                        "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({ user_id: data.user.id, amount })
                                    });
                                
                                    if (!putRes.ok) {
                                        throw new Error("PUT credit failed");
                                    }
                                    toast.success("Upgrade pro success");
                                }
                            }
                            fetch("/api/manage_account/check_credit",{
                                method: "POST",
                                headers:{
                                    "Authorization": `Bearer ${token}`
                                },
                                body: JSON.stringify({id: data.user.id})
                            }).then(async (res) => {
                                if (!res) {
                                    throw new Error(`Error HTTP: ${res}`);
                                }
                                const contentType = res.headers.get("content-type");
                                if (!contentType || !contentType.includes("application/json")) {
                                    throw new Error("Response is not valid JSON");
                                }
                                return res.json();
                            })
                            .then((data) => {
                                console.log("dataResponse: ",data.data[0].credits);
                                setCredits(data.data[0].credits);
                                if(data.data[0].expiration_date){
                                    const date = new Date(data.data[0].expiration_date).getDate() + "/" + (new Date(data.data[0].expiration_date).getMonth()+1) + "/" + new Date(data.data[0].expiration_date).getFullYear();;
                                    setExpirationDate(date);
                                }
                            })
                        }
                    })
                    .catch((error) => console.error("Error getting user information:", error));
                }
            }catch(error){
                console.log(error);
            }finally{
                setLoading(false);
            }
        };
        fetchData();
        
    },[]);

    const handleUpgradeCredits = async () => {
        if(userId){
            const response = await fetch("/api/payos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: 10000,
                    description: "Upgrade credits",
                    cancelUrl: "/component/upgrade_package",
                    returnUrl: "/component/upgrade_package"
                })
            });
        
            const data = await response.json();
            console.log("data: ",data);

            if(data.error) {
                console.error("Lỗi từ PayOS:", data.desc);
            }
            if (data && data.data.code === '00') {
                window.location.href = data.data.data.checkoutUrl;
            } 
        }
    }

    const handleUpgradeMonth = async () => {
        if(userId){
            const response = await fetch("/api/payos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: 30000,
                    description: "Upgrade month",
                    cancelUrl: "/component/upgrade_package",
                    returnUrl: "/component/upgrade_package"
                })
            });
        
            const data = await response.json();

            if(data.error) {
                console.error("Lỗi từ PayOS:", data.desc);
            }
            if (data && data.data.code === '00') {
                window.location.href = data.data.data.checkoutUrl;
            } 
        }
    }

    const handleUpgradeYear = async () => {
        if(userId){
            const response = await fetch("/api/payos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: 250000,
                    description: "Upgrade year",
                    cancelUrl: "/component/upgrade_package",
                    returnUrl: "/component/upgrade_package"
                })
            });
        
            const data = await response.json();

            if(data.error) {
                console.error("Lỗi từ PayOS:", data.desc);
            }
            if (data && data.data.code === '00') {
                window.location.href = data.data.data.checkoutUrl;
            } 
        }
    }

	return(
        <div className={styles.container}>
            <NavbarUser/>
            <div className={styles.container_content}>
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        Loading...
                    </div>
                    ) : (
                        <>
                        </>
                    )
                }
                <div className={styles.section}>
                    <div className={styles.section_link}>
                        <button onClick={() => setLinkCurrent("check")} className={ linkCurrent==="check" ? styles.check_credits : styles.check_credits_not_choose}>
                            <p>{t("title_check")}</p>
                        </button>
                        <button onClick={() => setLinkCurrent("upgrade")} className={ linkCurrent==="upgrade" ? styles.upgrade : styles.upgrade_not_choose}>
                            <p>{t("title_upgrade")}</p>
                        </button>
                    </div>
                    <div className={styles.package}>
                        { linkCurrent==="check" &&
                            <>
                                <div className={styles.form_check_credit}>
                                    <p className={styles.text_credits}><AddCardIcon/>{t("text_credits")}<span className={styles.highlight} style={{fontWeight: "bolder"}}>{credits}</span></p>
                                </div>
                                <div className={styles.form_check_expiration_date}>
                                    <p className={styles.text_expiration_date}><CalendarMonthIcon/>{t("text_expiration_date")}<span className={styles.highlight} style={{fontWeight: "bolder"}}>{expirationDate ? <p>{expirationDate}</p> : <p>{t("not_purchase")}</p>}</span></p>
                                </div>
                            </>
                        }
                        {
                            linkCurrent==="upgrade" && <div className={styles.form_upgrade}>
                                <h2 className={styles.title}>{t("title_page")}</h2>
                                <p className={styles.subtitle}>{t("subtitle_page")}</p>
                                <div className={styles.package_container}>
                                    <div className={styles.package_credits}>
                                        <h2>{t("package_credits_title")}</h2>
                                        <p className={styles.subtitle_package}>{t("package_credits_subtitle")}</p>
                                        <div className={styles.checkcircle}>
                                            <div className={styles.item_checkcircle}>
                                                <CheckCircle className={styles.icon_checkcircle_credits}/>
                                                <span className={styles.span}>{t("package_credits_check1")}</span>
                                            </div>
                                            <div className={styles.item_checkcircle}>
                                                <CheckCircle className={styles.icon_checkcircle_credits}/>
                                                <span className={styles.span}>{t("package_credits_check2")}</span>
                                            </div>
                                            <div className={styles.item_checkcircle}>
                                                <CheckCircle className={styles.icon_checkcircle_credits}/>
                                                <span className={styles.span}>{t("package_credits_check3")}</span>
                                            </div>
                                            <div className={styles.item_checkcircle}>
                                                <CheckCircle className={styles.icon_checkcircle_credits}/>
                                                <span className={styles.span}>{t("package_credits_check4")}</span>
                                            </div>
                                        </div>
                                        <button onClick={handleUpgradeCredits} className={styles.btn_package_credits} type="button">{t("package_credits_button")}</button>
                                    </div>
                                    <div className={styles.package_month}>
                                        <h2>{t("package_month_title")}</h2>
                                        <p className={styles.subtitle_package}>{t("package_month_subtitle")}</p>
                                        <div className={styles.checkcircle}>
                                            <div className={styles.item_checkcircle}>
                                                <CheckCircle className={styles.icon_checkcircle_month}/>
                                                <span className={styles.span}>{t("package_month_check1")}</span>
                                            </div>
                                            <div className={styles.item_checkcircle}>
                                                <CheckCircle className={styles.icon_checkcircle_month}/>
                                                <span className={styles.span}>{t("package_month_check2")}</span>
                                            </div>
                                            <div className={styles.item_checkcircle}>
                                                <CheckCircle className={styles.icon_checkcircle_month}/>
                                                <span className={styles.span}>{t("package_month_check3")}</span>
                                            </div>
                                            <div className={styles.item_checkcircle}>
                                                <CheckCircle className={styles.icon_checkcircle_month}/>
                                                <span className={styles.span}>{t("package_month_check4")}</span>
                                            </div>
                                        </div>
                                        <button onClick={handleUpgradeMonth} className={styles.btn_package_month} type="button">{t("package_month_button")}</button>
                                    </div>
                                    <div className={styles.package_year}>
                                        <h2>{t("package_year_title")}</h2>
                                        <p className={styles.subtitle_package}>{t("package_year_subtitle")}</p>
                                        <div className={styles.checkcircle}>
                                            <div className={styles.item_checkcircle}>
                                                <CheckCircle className={styles.icon_checkcircle_year}/>
                                                <span className={styles.span}>{t("package_year_check1")}</span>
                                            </div>
                                            <div className={styles.item_checkcircle}>
                                                <CheckCircle className={styles.icon_checkcircle_year}/>
                                                <span className={styles.span}>{t("package_year_check2")}</span>
                                            </div>
                                            <div className={styles.item_checkcircle}>
                                                <CheckCircle className={styles.icon_checkcircle_year}/>
                                                <span className={styles.span}>{t("package_year_check3")}</span>
                                            </div>
                                            <div className={styles.item_checkcircle}>
                                                <CheckCircle className={styles.icon_checkcircle_year}/>
                                                <span className={styles.span}>{t("package_year_check4")}</span>
                                            </div>
                                        </div>
                                        <button onClick={handleUpgradeYear} className={styles.btn_package_year} type="button">{t("package_month_button")}</button>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
            <ToastContainer/>
        </div>
    );
}

