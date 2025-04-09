"use client"
import { useTranslations } from "next-intl";
import styles from "../../../styles/content_generator.module.css"
import { useEffect, useState } from "react";
import Cookies from "js-cookie"; //Client component
import NavbarUser from "@/single_file/navbar_user";
import { useRouter } from "next/navigation";
import ShareIcon from '@mui/icons-material/Share';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import KeyIcon from '@mui/icons-material/Key';
import { toast, ToastContainer } from "react-toastify";
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from "../../authProvider";

interface User {
    id: string;
    avatar?: string;
    name?: string;
    username?: string;
}

function ContentGeneratorPage() {
    const t = useTranslations("content_generator");
    const [selectedPlatform, setSelectedPlatform] = useState("");
    const [selectTopic, setSelectTopic] = useState("");
    const [enterKeyword, setEnterKeyword] = useState("");
    const [selectedAudience, setSelectedAudience] = useState("public");
    const router = useRouter();
    const auth = useAuth() as { user: User };

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; 
    const formattedTime = today.getHours().toString().padStart(2, "0") + ":" + today.getMinutes().toString().padStart(2, "0"); 

    const [selectedDate, setSelectedDate] = useState(formattedDate);
    const [selectedTime, setSelectedTime] = useState("");

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setSelectedDate(newDate);
        setSelectedTime("");
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = new Date(`1970-01-01T${e.target.value}:00`);
        setSelectedTime(time.toLocaleTimeString("en-GB", { 
            timeZone: "Asia/Ho_Chi_Minh", 
            hour12: false 
        }));
    }

    useEffect(() => {
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
                    throw new Error(`t("error_http") ${res}`);
                }
                const contentType = res.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error(t("invalid_json"));
                }
                return res.json();
            })
            .then((data) => {
                if (data.user) {
                //     setUser(data.user.name);
                }
            })
            .catch((error) => console.error(t("error_get_user"), error));
        }
      }, []);

      const hanldeCreateContent = async() => {
        if(selectedPlatform==="" || selectedDate==="" || enterKeyword==="" || selectedAudience===""){
            toast.error(t("noti_error"));
            return;
        }else{
            const token = Cookies.get("token");
            if(!token)
                return;
            const responseQuantity = await fetch("/api/manage_account/check_credit",{
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({id: auth?.user.id})
            })
            const dataQuantity = await responseQuantity.json();
            const quantity_credit = dataQuantity.data[0].credits;
            if(quantity_credit === 0){
                toast.error(t("not_enough_credit"));
                return;
            }
            else{
                if(selectedPlatform === "Mastodon"){
                    const token = Cookies.get("mastodon_token");
                
                    if (!token) {
                        Cookies.set("redirect_params", new URLSearchParams({
                            platform: selectedPlatform,
                            date: `${selectedDate}T${selectedTime}`,
                            topic: selectTopic,
                            keyword: enterKeyword,
                            audience: selectedAudience,
                            user_Id: auth?.user.id
                        }).toString());
                        
                        window.location.href = "/api/mastodon/auth";  
                        return;
                    }
            
                    const queryParams = new URLSearchParams({
                        platform: selectedPlatform,
                        date: `${selectedDate}T${selectedTime}`,
                        topic: selectTopic,
                        keyword: enterKeyword,
                        audience: selectedAudience,
                        user_Id: auth?.user.id
                    }).toString();

                    router.push(`/component/post_manage/preview?${queryParams}`);
                }
                else if(selectedPlatform === "LinkedIn"){
                    const linkedin_access_token = Cookies.get("linkedin_access_token");
                
                    if (!linkedin_access_token) {
                        Cookies.set("redirect_params", new URLSearchParams({
                            platform: selectedPlatform,
                            date: `${selectedDate}T${selectedTime}`,
                            topic: selectTopic,
                            keyword: enterKeyword,
                            audience: selectedAudience,
                            user_Id: auth?.user.id
                        }).toString());
                        
                        window.location.href = "/api/linkedin/auth";  
                        return;
                    }
            
                    const queryParams = new URLSearchParams({
                        platform: selectedPlatform,
                        date: `${selectedDate}T${selectedTime}`,
                        topic: selectTopic,
                        keyword: enterKeyword,
                        audience: selectedAudience,
                        user_Id: auth?.user.id
                    }).toString();
                    
                    router.push(`/component/post_manage/preview_linkedin?${queryParams}`);
                }
            }
        }
      };

  return (
    <div className={styles.container}>
        <NavbarUser></NavbarUser>
        <div className={styles.post}>
            <p className={styles.title}>
                {t("btn_generate_content")}
            </p>
            <div className={styles.social_media}>
                <div className={styles.title_social_media}>
                    <div className={styles.icon_social_media}>
                        <ShareIcon></ShareIcon>
                    </div>
                    <p className={styles.text_social_media}>
                        {t("social_media")}
                    </p>
                </div>
                <div className={styles.platform_social_media}>
                    <button className={selectedPlatform === "Mastodon" ? styles.platform_facebook : styles.btn_platform_social_media} onClick={() => setSelectedPlatform("Mastodon")}>Mastodon</button>
                    <button className={selectedPlatform === "TikTok" ? styles.platform_tiktok : styles.btn_platform_social_media} onClick={() => setSelectedPlatform("TikTok")}>TikTok</button>
                    <button className={selectedPlatform === "LinkedIn" ? styles.platform_linkedin : styles.btn_platform_social_media} onClick={() => setSelectedPlatform("LinkedIn")}>LinkedIn</button>
                </div>
            </div>
            <div className={styles.post_time}>
                <label className={styles.title_post_time} htmlFor="post_time">
                    <div className={styles.icon_post_time}>
                        <WatchLaterIcon></WatchLaterIcon>
                    </div>
                    <p className={styles.text_post_time}>
                        {t("post_time")}
                    </p>
                </label>
                <input  className={styles.input_date} id="post_time"
                    type="date"
                    min={formattedDate}
                    value={selectedDate}
                    onChange={handleDateChange}
                />
                <input  className={styles.input_time}
                    type="time"
                    value={selectedTime}
                    onChange={handleTimeChange}
                    min={selectedDate === formattedDate ? formattedTime : "00:00"}
                />
            </div>
            {/* <div className={styles.number_of_week}>
                <label className={styles.title_number_of_week} htmlFor="number_of_week">
                    <div className={styles.icon_number_of_week}>
                        <CalendarMonthIcon></CalendarMonthIcon>
                    </div>
                    <p className={styles.text_number_of_week}>{t("number_of_week")}</p>
                </label>
                <input type="number" id="number_of_week" min="0" className={styles.input_number} value={selectedNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedNumber(Number(e.target.value))}/>
            </div> */}
            <div className={styles.topic}>
                <label className={styles.title_topic} htmlFor="topic">
                    <div className={styles.icon_topic}>
                        <KeyIcon></KeyIcon>
                    </div>
                    <p className={styles.text_topic}>{t("topic")}</p>
                </label>
                <div className={styles.content_topic}>
                    <select className={styles.select_topic} onChange={(e) => setSelectTopic(e.target.value)} value={selectTopic}>
                        <option value="Âm nhạc">{t("option_music")}</option>
                        <option value="Mua sắm">{t("option_shopping")}</option>
                        <option value="Truyện">{t("option_story")}</option>
                    </select>
                    <input disabled={selectTopic ? false : true} type="text"  id="topic" className={styles.input_topic} placeholder={t("enter_topic")}
                    value={enterKeyword} onChange={(e) => setEnterKeyword(e.target.value)}/>
                </div>
            </div>
            <div className={styles.audience}>
                <label className={styles.title_audience} htmlFor="topic">
                    <div className={styles.icon_audience}>
                        <PersonIcon></PersonIcon>
                    </div>
                    <p className={styles.text_audience}>{t("audience")}</p>
                </label>
                <div className={styles.content_audience}>
                    <select className={styles.select_audience} onChange={(e) => setSelectedAudience(e.target.value)} value={selectedAudience}>
                        <option value="public">{t("public")}</option>
                        <option value="private">{t("private")}</option>
                    </select>
                </div>
            </div>
            {/* <div className={styles.enable_trend}>
                <div className={styles.title_enable_trend}>
                    <div className={styles.icon_enable_trend}>
                        <LocalFireDepartmentIcon></LocalFireDepartmentIcon>
                    </div>
                    <p className={styles.text_enable_trend}>{t("enable_trend")}</p>
                </div>
                <div 
                    className={`${styles.toggle} ${isOn ? styles.on : ""}`} 
                    onClick={() => setIsOn(!isOn)}
                    >
                    <div className={styles.circle}></div>
                </div>
            </div> */}
            <div className={styles.generate_content}>
                <button onClick={hanldeCreateContent} className={styles.btn_generate_content}>{t("btn_generate_content")}</button>
            </div>
        </div>
        <ToastContainer></ToastContainer>
    </div>
  );
}

export default ContentGeneratorPage;