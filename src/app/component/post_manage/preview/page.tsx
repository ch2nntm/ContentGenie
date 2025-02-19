"use client";
import React, {useEffect, useState} from 'react';
import { useTranslations } from 'next-intl';
import styles from "../../../styles/preview.module.css";
import Image from 'next/image';
import Link from 'next/link';
import Cookies from "js-cookie";

function PreviewPage() {

    const t = useTranslations("preview");
    const [user, setUser] = useState<string | null>(null);

    const [showDropdownUser, setShowDropdownUser] = useState(false);

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
                        <p className={styles.name_user_manage}>{user}</p>
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
            <form action="" className={styles.form}>
                <div className={styles.post}>
                    <div className={styles.inf_user}>
                        <div className={styles.inf_user_avt}>
                            <Image src="/avt_preview.png" alt="Avt" fill></Image>
                        </div>
                        <div className={styles.inf_user_more}>
                            <p className={styles.name_user}>Jane Smith</p>
                            <p className={styles.time}>2 {t("time")}</p>
                        </div>
                    </div>
                    <div className={styles.inf_post}>
                        <p className="content_post">
                            Excited to share our new product line with everyone! #Innovation #Tech
                        </p>
                        <div className={styles.img_main_post}>
                            <Image src="/img_main_preview.png" alt="Img main post" fill></Image>
                        </div>
                    </div>
                    <div className={styles.interact_post}>
                        <div className={styles.like_post}>
                            <div className={styles.icon_like_post}>
                                <Image src="/icon_heart.png" alt="Icon like post" fill></Image>
                            </div>
                            <p className={styles.text_like_post}>256</p>
                        </div>
                        <div className={styles.comment_post}>
                            <div className={styles.icon_comment_post}>
                                <Image src="/icon_comment.png" alt="Icon comment post" fill></Image>
                            </div>
                            <p className={styles.text_comment_post}>34</p>
                        </div>
                        <div className={styles.share_post}>
                            <div className={styles.icon_share_post}>
                                    <Image src="/icon_share.png" alt="Icon share post" fill></Image>
                                </div>
                                <p className={styles.text_share_post}>{t("share")}</p>
                        </div>
                    </div>
                </div>
                <div className={styles.scheduled_post}>
                    <p className={styles.title_scheduled_post}>{t("scheduled_post")}</p>
                    <div className={styles.time_scheduled_post}>
                        <button className={styles.item}>Jan 15</button>
                        <button className={styles.item}>Jan 22</button>
                        <button className={styles.item}>Jan 29</button>
                    </div>
                </div>
                <button className={styles.btn_edit}>
                    {t("btn_edit")}
                </button>
            </form>
        </div>
    );
}

export default PreviewPage;