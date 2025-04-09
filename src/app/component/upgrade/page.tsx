"use client";
import { ArrowRight, CheckCircle } from "@mui/icons-material";
import NavbarUser from "@/single_file/navbar_user";
import styles from "../../styles/upgrade.module.css";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function UpgradePro() {
    const [userId, setUserId] = useState(0);
    const [credits, setCredits] = useState(0);
    const searchParams = useSearchParams();
    const code = searchParams.get("code") || "";
    const status = searchParams.get("status") || "";
    const t = useTranslations("upgrade");
    const [isLoading, setIsLoading] = useState(true);

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
                            if(code && status==="PAID"){
                                const putRes = await fetch("/api/manage_account/check_credit", {
                                    method: "PUT",
                                    headers: {
                                      "Authorization": `Bearer ${token}`,
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ id: data.user.id })
                                  });
                              
                                  if (!putRes.ok) {
                                    throw new Error("PUT credit thất bại");
                                  }
                              
                                  toast.success("Upgrade pro success");
                            }
                            fetch("/api/manage_account/check_credit",{
                                method: "POST",
                                headers:{
                                    "Authorization": `Bearer ${token}`
                                },
                                body: JSON.stringify({id: data.user.id})
                            }).then(async (res) => {
                                if (!res) {
                                    throw new Error(`Lỗi HTTP: ${res}`);
                                }
                                const contentType = res.headers.get("content-type");
                                if (!contentType || !contentType.includes("application/json")) {
                                    throw new Error("Phản hồi không phải JSON hợp lệ");
                                }
                                return res.json();
                            })
                            .then((data) => {
                                console.log("dataResponse: ",data.data[0].credits);
                                setCredits(data.data[0].credits);
                            })
                        }
                    })
                    .catch((error) => console.error("Lỗi lấy thông tin user:", error));
                }
            }catch(error){
                console.log(error);
            }finally{
                setIsLoading(false);
            }
        };
        fetchData();
        
    },[]);

    const handlePayment = async () => {
        if(userId){
            const response = await fetch("/api/payos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: 1,
                    description: "Upgrade pro",
                    cancelUrl: "/component/upgrade",
                    returnUrl: "/component/upgrade"
                })
            });
        
            const data = await response.json();
            console.log("Data: ",data.error);

            if(data.error) {
                toast.error("Mã không hợp lệ!");
                console.error("Lỗi từ PayOS:", data.desc);
            }
            if (data && data.paymentUrl.code === '00') {
                console.log("DATA: ",data.paymentUrl.data.checkoutUrl);
                window.location.href = data.paymentUrl.data.checkoutUrl;
            } 
        }
        else{
            toast.error("Vui long dang nhap!");
        }
    };
  return (
    <div className={styles.container}>
        <NavbarUser/>
      {!isLoading && <div className={styles.container_content}>
        <p className={styles.text_credits}>{t("text_credits")}<span style={{fontWeight: "bolder"}}>{credits}</span></p>
        <div className={styles.content}>
            <h2 className={styles.title}>{t("title_page")}</h2>
            <p className={styles.subtitle}>{t("subtitle_page")}</p>

            <div className={styles.intro}>
                <div className={styles.img_upgrade}>
                    <Image src="/img_upgrade.png" fill alt=""/>
                </div>
                <div className={styles.checkcircle}>
                    <div className={styles.item_checkcircle}>
                        <CheckCircle className={styles.icon_checkcircle}/>
                        <span>{t("check_1")}</span>
                    </div>
                    <div className={styles.item_checkcircle}>
                        <CheckCircle className={styles.icon_checkcircle}/>
                        <span>{t("check_2")}</span>
                    </div>
                    <div className={styles.item_checkcircle}>
                        <CheckCircle className={styles.icon_checkcircle}/>
                        <span>{t("check_3")}</span>
                    </div>
                    </div>
            </div>
            <div className={styles.footer}>
                <div className={styles.footet_text}>
                    <p className={styles.title_footer}>{t("title1_footer")}<span style={{fontWeight: "bold"}}>1.000đ</span>{t("title2_footer")}</p>
                    <p>{t("subtitle_footer")}</p>
                </div>
                <div className={styles.around_btn}>
                    <button type="button" onClick={handlePayment} className={styles.btn_upgrade}>
                        {t("btn_upgrade1")}<span className={styles.btn_upgrade_vip}>{t("btn_upgrade2")}</span> <ArrowRight className={styles.arrowright}/>
                    </button>
                </div>
            </div>
        </div>
        <ToastContainer/>
      </div>
        }
    </div>
  );
}
