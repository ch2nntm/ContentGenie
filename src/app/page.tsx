"use client";

import Image from "next/image";
import styles from "./styles/pageMain.module.css";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const t = useTranslations("homepage");  

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

  const handleLogout = async () => {
    try {
        const token = Cookies.get("token");

        if (!token) {
          router.push("/component/account_user/login");
          return;
        }

        const res = await fetch("/api/manage_account/logout", { method: "POST" });

        if (res) {
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            setUser(null); 
            toast.success("Đăng xuất thành công!");
        } else {
            toast.error("Đăng xuất thất bại!");
        }
    } catch (error) {
        console.error("Lỗi khi đăng xuất:", error);
        toast.error("Có lỗi xảy ra!");
    }
  };

  const handleCreate = async () => {
    try {
      if (!user) {
        router.push("/component/account_user/login_user");
        // return;
      }
      else{
        router.push("/component/post_manage/content_generator");
      }
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra!");
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.img_card_container}>
            <Image className={styles.image_card} src="/image_card.png" alt="Card" fill loading="lazy"/>
          </div>
        </div>
        <div className={styles.text}>
          <div className={styles.navbar}>
            {user && <label className={user ? styles.label_user : styles.label_user_hide}>{t("hello")} {user}!</label>}
            <button onClick={handleLogout} className={user ? styles.btn_logout_show : styles.btn_logout_hide}>{t("signout")}</button>
          </div>
          <div className={styles.img_text_container}>
            <Image className={styles.image_text} src="/image_text.png" alt="Icon" fill loading="lazy" />
          </div>
          
          <h1 className={styles.main_text}>{t("main_text")}</h1>
          <h3 className={styles.tilte_text}>{t("title_text")}</h3>
          <button onClick={handleCreate} className={styles.btnCreate}>{t("create")}</button>
          <ToastContainer/>
        </div>
      </div>
    </>
  );
}
