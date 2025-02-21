"use client"
import NavbarUser from "@/single_file/navbar_user";
import styles from "../../../styles/edit_profile.module.css"
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";

function EditProfilePage() {

    const t = useTranslations("edit_profile");
    const [nameUser, setNameUser] = useState("");
    const [inputName, setInputName] = useState("");
    const [userName, setUserName] = useState("");
    const [inputUserName, setInputUserName] = useState("");
    const [password, setPassword] = useState("");

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
                    setNameUser(data.user.name);
                    setInputName(data.user.name);
                    setUserName(data.user.username);
                    setInputUserName(data.user.username);
                    setPassword(data.user.password);
                }
            })
            .catch((error) => console.error("Lỗi lấy thông tin user:", error));
        }
    }, []);

    const handleSubmitSave = () => {
        if(!inputUserName || !inputName){
            toast.error("Please enter full information");
            return;
        }
        else{
            const token = Cookies.get("token");
            if (token) {
                fetch("/api/manage_account/edit_profile", {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userName: userName,
                        password: password,
                        inputName: inputName,
                        inputUserName: inputUserName
                    }),
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
                    // const data = await res.json();
                    console.log("Data:",data);
                    if (data.accessToken) {
                        Cookies.set("token", data.accessToken, { expires: 1 }); // Cập nhật token mới
                    }
                    if (data) {
                        toast.success(data.message);
                        // setTimeout(() => {
                        //     window.location.reload();
                        // }, 1000);
                    }
                    else if (data.error) {
                        toast.error(data.error);
                    }
                })
                .catch((error) => console.error("Lỗi thay đổi mật khẩu:", error));
            }
        }
    }

  return (
    <div className={styles.container}>
        <NavbarUser></NavbarUser>
        <div className={styles.content}>
            <div className={styles.sidebar}>
                <p className={styles.sidebar_name_user}>{t("hi")} {nameUser}!</p>
                <div className={styles.sidebar_account_manage}>
                    <div className={styles.icon_account_manage}>
                        <Image src="/icon_account_manage.png" alt="Icon account manage" fill></Image>
                    </div>
                    <p className={styles.text_account_manage}>{t("account_manage")}</p>
                </div>
                <Link href="" className={styles.sidebar_edit_profile}>{t("edit_profile")}</Link>
                <Link href="/component/account_user/change_password" className={styles.sidebar_change_password}>{t("change_password")}</Link>
            </div>
            <div className={styles.section}>
                <p className={styles.title_section}>
                    {t("account_manage")}
                </p>
                <div className={styles.section_link}>
                    <Link href="" className={styles.section_edit_profile}>{t("edit_profile")}</Link>
                    <Link href="/component/account_user/change_password" className={styles.section_change_password}>{t("change_password")}</Link>
                </div>
                <p className={styles.title_link}>{t("edit_profile")}</p>
                <div className={styles.form_section}>
                    <div className={styles.name}>
                        <label htmlFor="name" className={styles.label}>{t("name")} <p className={styles.icon_start}>*</p></label>
                        <input id="name" type="text" className={styles.input}
                        value={inputName} onChange={(e)=>setInputName(e.target.value)}/>
                    </div>
                    <div className={styles.user_name}>
                        <label htmlFor="username" className={styles.label}>{t("username")} <p className={styles.icon_start}>*</p></label>
                        <input id="username" type="text" className={styles.input}
                        value={inputUserName} onChange={(e)=>setInputUserName(e.target.value)}/>
                    </div>
                    <div className={styles.section_btn}>
                        <button className={styles.btn_save} onClick={handleSubmitSave}>{t("btn_save")}</button>
                    </div>
                    <ToastContainer/>
                </div>
            </div>
        </div>
    </div>
  );
}

export default EditProfilePage