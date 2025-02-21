"use client";
import { useEffect, useState } from "react";
import styles from "../../../styles/change_password.module.css";
import Image from "next/image";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import NavbarUser from "../../../../single_file/navbar_user";

function ChangePassword(){
    const t = useTranslations("change_password");
    const [nameUser, setNameUser] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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
                    setUserName(data.user.username);
                    setPassword(data.user.password);
                }
            })
            .catch((error) => console.error("Lỗi lấy thông tin user:", error));
        }
      }, []);

      const handleSubmitRefresh = () => {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      const handleSubmitSave = () => {
        console.log("Sending data:", { userName, oldPassword, newPassword });
        if(!oldPassword || !newPassword || !confirmPassword){
            toast.error("Please enter full information");
            return;
        }
        else if(newPassword !== confirmPassword){
            toast.error("New password and confirm password do not match");
            return;
        }
        else if(password !== oldPassword){
            toast.error("Old password is incorrect");
            return;
        }
        else{
            const token = Cookies.get("token");
            if (token) {
                fetch("/api/manage_account/change_password", {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userName: userName,
                        password: password,
                        newPassword: newPassword,
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
                    console.log("Data:",data);
                    if (data.accessToken) {
                        Cookies.set("token", data.accessToken, { expires: 1 }); // Cập nhật token mới
                    }
                    if (data.message) {
                        toast.success(data.message);
                        setOldPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
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
            {/* <div className={styles.navbar}>
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
                    <button className={styles.button_user}>
                        <div className={styles.icon_user}>
                            <Image src="/icon_circle_user.png" alt="User" fill ></Image>
                        </div>
                    </button>
                </div>
            </div> */}
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
                    <Link href="/component/account_user/edit_profile" className={styles.sidebar_edit_profile}>{t("edit_profile")}</Link>
                    <Link href="" className={styles.sidebar_change_password}>{t("change_password")}</Link>
                </div>
                <div className={styles.section}>
                    <p className={styles.title_section}>
                        {t("account_manage")}
                    </p>
                    <div className={styles.section_link}>
                        <Link href="/component/account_user/edit_profile" className={styles.section_edit_profile}>{t("edit_profile")}</Link>
                        <Link href="" className={styles.section_change_password}>{t("change_password")}</Link>
                    </div>
                    <p className={styles.title_link}>{t("change_password")}</p>
                    <div className={styles.form}>
                        <div className={styles.old_password}>
                            <label htmlFor="old_password" className={styles.label}>{t("old_password")} <p className={styles.icon_start}>*</p></label>
                            <input id="old_password" type={showOldPassword ? "text" : "password"} className={styles.input}
                            value={oldPassword} onChange={(e)=>setOldPassword(e.target.value)}/>
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className={styles.toggle_button}
                            >
                                <div className={styles.eye_password}>
                                    <Image src={showOldPassword ? "/fa_eye_slash.png" : "/fa_eye.png"} alt="Eye Password" fill></Image>
                                </div>
                            </button>
                        </div>
                        <div className={styles.new_password}>
                            <label htmlFor="new_password" className={styles.label}>{t("new_password")} <p className={styles.icon_start}>*</p></label>
                            <input id="new_password" type={showNewPassword ? "text" : "password"} className={styles.input}
                            value={newPassword} onChange={(e)=>setNewPassword(e.target.value)}/>
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className={styles.toggle_button}
                            >
                                <div className={styles.eye_password}>
                                    <Image src={showNewPassword ? "/fa_eye_slash.png" : "/fa_eye.png"} alt="Eye Password" fill></Image>
                                </div>
                            </button>
                        </div>
                        <div className={styles.confirm_password}>
                            <label htmlFor="confirm_password" className={styles.label}>{t("confirm_password")} <p className={styles.icon_start}>*</p></label>
                            <input id="confirm_password" type={showConfirmPassword ? "text" : "password"} className={styles.input}
                            value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)}/>
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className={styles.toggle_button}
                            >
                                <div className={styles.eye_password}>
                                    <Image src={showConfirmPassword ? "/fa_eye_slash.png" : "/fa_eye.png"} alt="Eye Password" fill></Image>
                                </div>
                            </button>
                        </div>
                        <div className={styles.section_btn}>
                            <button className={styles.btn_refresh} onClick={handleSubmitRefresh}>{t("btn_refresh")}</button>
                            <button className={styles.btn_save} onClick={handleSubmitSave}>{t("btn_save")}</button>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    )
}

export default ChangePassword;