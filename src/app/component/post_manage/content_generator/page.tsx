"use client"
import { useTranslations } from "next-intl";
import styles from "../content_generator/content_generator.module.css";
import { useEffect, useState } from "react";
import Cookies from "js-cookie"; 
import NavbarUser from "@/app/component/navbar_user/page";
import { useRouter } from "next/navigation";
import ShareIcon from '@mui/icons-material/Share';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import KeyIcon from '@mui/icons-material/Key';
import { toast, ToastContainer } from "react-toastify";
import PersonIcon from '@mui/icons-material/Person';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useAuth } from "../../authProvider";
import Image from "next/image";
import Link from "next/link";

interface User {
    id: string;
    avatar?: string;
    name?: string;
    username?: string;
}

function ContentGeneratorPage() {
    const t = useTranslations("content_generator");
    const [selectedPlatform, setSelectedPlatform] = useState("");
    const [selectTopic, setSelectTopic] = useState("Spotify");
    const [enterKeyword, setEnterKeyword] = useState("");
    const [selectedAudience, setSelectedAudience] = useState("");
    const [isOnDaily, setIsOnDaily] = useState(false);
    const [isFullField, setIsFullField] = useState(false);
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
      }, []);

      const hanldeCreateContent = async() => {
        if(selectedPlatform==="" || selectedDate==="" || enterKeyword==="" || selectedAudience===""){
            toast.error(t("noti_error"));
            return;
        }else{
            setIsFullField(true);
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
            const expiration_date = dataQuantity.data[0].expiration_date;
            
            if((quantity_credit === 0 && !expiration_date) || (quantity_credit === 0 && expiration_date < Date.now())){
                toast.error(t("not_enough_credit"));
                return;
            }
            else{
                if(selectedPlatform === "Mastodon"){
                    const token = Cookies.get("mastodon_token");
                
                    if (!token) {
                        Cookies.set("redirect_params_mastodon", new URLSearchParams({
                            platform: selectedPlatform,
                            date: `${selectedDate}T${selectedTime}`,
                            topic: selectTopic,
                            keyword: enterKeyword,
                            audience: selectedAudience,
                            user_Id: auth?.user.id,
                            set_daily: isOnDaily.toString(),
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
                        user_Id: auth?.user.id,
                        set_daily: isOnDaily.toString()
                    }).toString();

                    router.push(`/component/post_manage/preview?${queryParams}`);
                }
                else if(selectedPlatform === "LinkedIn"){
                    const linkedin_access_token = Cookies.get("linkedin_access_token");
                
                    if (!linkedin_access_token) {
                        Cookies.set("redirect_params_linkedin", new URLSearchParams({
                            platform: selectedPlatform,
                            date: `${selectedDate}T${selectedTime}`,
                            topic: selectTopic,
                            keyword: enterKeyword,
                            audience: selectedAudience,
                            user_Id: auth?.user.id,
                            set_daily: isOnDaily.toString()
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
                        user_Id: auth?.user.id,
                        set_daily: isOnDaily.toString()
                    }).toString();
                    
                    router.push(`/component/post_manage/preview_linkedin?${queryParams}`);
                }
            }
        }
      };

  return (
    <div className={styles.container}>
        <NavbarUser></NavbarUser>
        <div className={styles.post_container}>
            <p className={styles.title}>
                {t("btn_generate_content")}
            </p>
            <div className={styles.post}>
                <div className={styles.social_media}>
                    <div className={styles.title_social_media}>
                        <div className={styles.icon_social_media}>
                            <ShareIcon></ShareIcon>
                        </div>
                        <p className={styles.text_social_media}>
                            {t("social_media")}
                            <span className={styles.require}>*</span>
                        </p>
                    </div>
                    <div className={styles.platform_social_media}>
                        <button className={selectedPlatform === "Mastodon" ? styles.platform_mastodon : styles.btn_platform_social_media} onClick={() => setSelectedPlatform("Mastodon")}>
                            <div className={styles.icon_mastodon}>
                                <Image src="/icon_mastodon.png" alt="Mastodon" width={20} height={20} />
                            </div>
                            <p>Mastodon</p>
                        </button>
                        <button className={selectedPlatform === "LinkedIn" ? styles.platform_linkedin : styles.btn_platform_social_media} onClick={() => setSelectedPlatform("LinkedIn")}>
                            <div className={styles.icon_mastodon}>
                                <Image src="/icon_linkedin.webp" alt="Mastodon" width={20} height={20} />
                            </div>
                            <p>LinkedIn</p>
                        </button>
                        <button className={selectedPlatform === "TikTok" ? styles.platform_tiktok : styles.btn_platform_social_media} onClick={() => setSelectedPlatform("TikTok")}>
                            <div className={styles.icon_mastodon}>
                                <Image src="/icon_tiktok.webp" alt="Mastodon" width={25} height={25} />
                            </div>
                            <p>TikTok</p>
                        </button> 
                        {!selectedPlatform && <span className={styles.warn_platform}>!</span>}
                        {selectedPlatform && <span className={styles.warn_platform}></span>} 
                    </div>
                </div>
                <div className={styles.post_time}>
                    <label className={styles.title_post_time} htmlFor="post_time">
                        <div className={styles.icon_post_time}>
                            <WatchLaterIcon></WatchLaterIcon>
                        </div>
                        <p className={styles.text_post_time}>
                            {t("post_time")}
                            <span className={styles.require}>*</span>
                        </p>
                    </label>
                    <div className={styles.input_datetime}>
                        <input className={selectedDate ? styles.input_date : styles.warn_input_date} id="post_time"
                            type="date"
                            min={formattedDate}
                            value={selectedDate}
                            onChange={handleDateChange}
                        />
                        <input className={selectedTime ? styles.input_time : styles.warn_input_time}
                            type="time"
                            value={selectedTime}
                            onChange={handleTimeChange}
                            min={selectedDate === formattedDate ? formattedTime : "00:00"}
                        />
                    </div>
                </div>
                <div className={styles.topic}>
                    <label className={styles.title_topic} htmlFor="topic">
                        <div className={styles.icon_topic}>
                            <KeyIcon></KeyIcon>
                        </div>
                        <p className={styles.text_topic}>
                            {t("topic")}
                            <span className={styles.require}>*</span>
                        </p>
                    </label>
                    <div className={styles.content_topic}>
                        <select className={styles.select_topic} onChange={(e) => setSelectTopic(e.target.value)} value={selectTopic}>
                            <option value="Spotify">{t("option_spotify")}</option>
                            <option value="Youtube">{t("option_youtube")}</option>
                            <option value="Image">{t("option_image")}</option>
                            <option value="Tale">{t("option_tale")}</option>
                        </select>
                        <input disabled={selectTopic ? false : true} type="text"  id="topic" className={(!isFullField && !enterKeyword) ? styles.input_topic_miss : styles.input_topic} placeholder={t("enter_topic")}
                        value={enterKeyword} onChange={(e) => setEnterKeyword(e.target.value)}/>
                    </div>
                </div>
                <div className={styles.audience}>
                    <label className={styles.title_audience} htmlFor="topic">
                        <div className={styles.icon_audience}>
                            <PersonIcon></PersonIcon>
                        </div>
                        <p className={styles.text_audience}>
                            {t("audience")}
                            <span className={styles.require}>*</span>
                        </p>
                    </label>
                    <div className={styles.content_audience}>
                        <div className={styles.radio_public}>
                            <input type="radio" value="public" name="selectedAudience" onChange={(e) => setSelectedAudience(e.target.value)} /> {t("public")}
                        </div>
                        <div className={styles.radio_private}>
                            <input type="radio" value="private" name="selectedAudience" onChange={(e) => setSelectedAudience(e.target.value)} /> {t("private")}
                        </div>
                    </div>
                </div>
                <div className={styles.enable_trend}>
                    <div className={styles.title_enable_trend}>
                        <div className={styles.icon_enable_trend}>
                            <LocalFireDepartmentIcon></LocalFireDepartmentIcon>
                        </div>
                        <p className={styles.text_enable_trend}>
                            {t("post_daily")}
                            <span className={styles.require}>*</span>
                        </p>
                    </div>
                    <div 
                        className={`${styles.toggle} ${isOnDaily ? styles.on : ""}`} 
                        onClick={() => setIsOnDaily(!isOnDaily)}
                        >
                        <div className={styles.circle}></div>
                    </div>
                </div>
            </div>
            <div className={styles.generate_content}>
                <button onClick={hanldeCreateContent} disabled={!selectTopic || !selectedDate || !selectedTime || !enterKeyword || !selectedAudience} className={ (!selectTopic || !selectedDate || !selectedTime || !enterKeyword || !selectedAudience) ? styles.btn_generate_content_disable : styles.btn_generate_content}>
                    {t("btn_generate_content")}
                </button>
                <Link href="/component/post_manage/list_post_user" className={styles.btn_back}>Back to Post Management</Link>
            </div>
        </div>
        <ToastContainer></ToastContainer>
    </div>
  );
}

export default ContentGeneratorPage;