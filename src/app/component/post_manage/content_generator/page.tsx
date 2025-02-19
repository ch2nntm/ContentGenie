"use client"
import { useTranslations } from "next-intl";
import styles from "../../../styles/content_generator.module.css"
import Image from 'next/image';
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";

function ContentGeneratorPage() {

    const [user, setUser] = useState<string | null>(null);
    const t = useTranslations("content_generator");
    const [selectedPlatform, setSelectedPlatform] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedNumber, setSelectedNumber] = useState(0);
    const [enterTopic, setEnterTopic] = useState("");
    const [isOn, setIsOn] = useState(false);
    const [showDropdownUser, setShowDropdownUser] = useState(false);

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(event.target.value);
    };    

    useEffect(() => {
        const token = Cookies.get("token");
        if (token) {
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
            .then((data) => {
                if (data.user) {
                    setUser(data.user.name);
                }
            })
            .catch((error) => console.error("Lỗi lấy thông tin user:", error));
        }
      }, []);

  return (
    <div className={styles.container}>
        <div className={styles.navbar}>
            <div className={styles.title_logo}>
                <div className={styles.icon_logo}>
                    <Image src="/wand_magic_sparkles.png" alt="logo" fill ></Image>
                </div>
                <h1 className={styles.title_navbar}>ContentGenie</h1>
            </div>
            <div className={styles.icon_navbar}>
                    <button className={styles.icon_bell}>
                        <Image src="/icon_bell.png" alt="Noti" fill ></Image>
                    </button>
                    <button className={styles.button_user} onClick={() => setShowDropdownUser(!showDropdownUser)}>
                        <div className={styles.icon_user}>
                            <Image src="/icon_circle_user.png" alt="User" fill ></Image>
                        </div>
                        <p className={styles.name_user}>{user}</p>
                    </button>
                    <div className={showDropdownUser ? styles.manage_user_show : styles.manage_user_hide}>
                        <Link href="" className={styles.edit_profile}>
                            <div className={styles.icon_edit_profile}>
                                <Image src="/icon_edit_profile.png" alt="Icon edit profile" fill></Image>
                            </div>
                            <p>{t("account_management")}</p>
                        </Link>
                    </div>
                </div>
        </div>
        <div className={styles.post}>
            <p className={styles.title}>
                {t("btn_generate_content")}
            </p>
            <div className={styles.social_media}>
                <div className={styles.title_social_media}>
                    <div className={styles.icon_social_media}>
                        <Image src="/icon_share_alt.png" alt="Icon select social media" fill></Image>
                    </div>
                    <p className={styles.text_social_media}>
                        {t("social_media")}
                    </p>
                </div>
                <div className={styles.platform_social_media}>
                    <button className={selectedPlatform === "Facebook" ? styles.platform_facebook : styles.btn_platform_social_media} onClick={() => setSelectedPlatform("Facebook")}>Facebook</button>
                    <button className={selectedPlatform === "TikTok" ? styles.platform_tiktok : styles.btn_platform_social_media} onClick={() => setSelectedPlatform("TikTok")}>TikTok</button>
                    <button className={selectedPlatform === "Instagram" ? styles.platform_instagram : styles.btn_platform_social_media} onClick={() => setSelectedPlatform("Instagram")}>Instagram</button>
                </div>
            </div>
            <div className={styles.post_time}>
                <div className={styles.title_post_time}>
                    <div className={styles.icon_post_time}>
                        <Image src="/icon_clock.png" alt="Icon clock" fill></Image>
                    </div>
                    <p className={styles.text_post_time}>
                        {t("post_time")}
                    </p>
                </div>
                <input className={styles.input_date} min={formattedDate} type="date" value={selectedDate} onChange={handleDateChange} />
            </div>
            <div className={styles.number_of_week}>
                <div className={styles.title_number_of_week}>
                    <div className={styles.icon_number_of_week}>
                        <Image src="/icon_calendar.png" alt="Icon calendar" fill></Image>
                    </div>
                    <p className={styles.text_number_of_week}>{t("number_of_week")}</p>
                </div>
                <input type="number" className={styles.input_number} value={selectedNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedNumber(Number(e.target.value))}/>
            </div>
            <div className={styles.topic}>
                <div className={styles.title_topic}>
                    <div className={styles.icon_topic}>
                        <Image src="/icon_key.png" alt="Icon key" fill></Image>
                    </div>
                    <p className={styles.text_topic}>{t("topic")}</p>
                </div>
                <input type="text" className={styles.input_topic} placeholder={t("enter_topic")}
                value={enterTopic} onChange={(e) => setEnterTopic(e.target.value)}/>
            </div>
            <div className={styles.enable_trend}>
                <div className={styles.title_enable_trend}>
                    <div className={styles.icon_enable_trend}>
                        <Image src="/icon_fire.png" alt="Icon fire" fill></Image>
                    </div>
                    <p className={styles.text_enable_trend}>{t("enable_trend")}</p>
                </div>
                <div 
                    className={`${styles.toggle} ${isOn ? styles.on : ""}`} 
                    onClick={() => setIsOn(!isOn)}
                    >
                    <div className={styles.circle}></div>
                </div>
            </div>
            <div className={styles.generate_content}>
                <button className={styles.btn_generate_content}>{t("btn_generate_content")}</button>
            </div>
        </div>
    </div>
  );
}

export default ContentGeneratorPage;