"use client";
import { useEffect, useState } from "react";
import styles from "../change_password/change_password.module.css";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import NavbarUser from "../../../../components/navbar_user";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

function ChangePassword(){
    const t = useTranslations("change_password");
    const [nameUser, setNameUser] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const fetchUserData = () => {
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
                    throw new Error(t("invalid_json"));
                }
                return res.json();
            })
            .then((data) => {
                if (data.user) {
                    setNameUser(data.user.name);
                    setEmail(data.user.email);
                    setPassword(data.user.password);
                }
            })
            .catch((error) => console.error(t("error_get_user"), error));
        }
    }

    useEffect(() => {
        fetchUserData();
      }, []);

      const handleSubmitRefresh = () => {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      const handleSubmitSave = () => {

        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if(!oldPassword || !newPassword || !confirmPassword){
            toast.error(t("enter_full"));
            return;
        }
        else if(password !== oldPassword){
            toast.error(t("password_incorrect"));
            return;
        }
        else if (!passwordRegex.test(newPassword) || !passwordRegex.test(newPassword)) {
            toast.error(t("password_not_format"));
            return;
        } 
        else if(newPassword !== confirmPassword){
            toast.error(t("password_not_match"));
            return;
        }
        else if(oldPassword === newPassword){
            toast.error(t("password_same"));
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
                        email: email,
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
                        throw new Error(t("invalid_json"));
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
                        fetchUserData();
                        window.location.reload();
                    }
                    else if (data.error) {
                        toast.error(data.error);
                    }
                })
                .catch((error) => console.error(t("error_change_password"), error));
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
                            <ManageAccountsIcon></ManageAccountsIcon>
                        </div>
                        <p className={styles.text_account_manage}>{t("account_manage")}</p>
                    </div>
                    <Link href="/component/account_user/edit_profile" className={styles.sidebar_edit_profile}>{t("edit_profile")}</Link>
                    <Link href="" className={styles.sidebar_change_password}>{t("change_password")}</Link>
                </div>
                <div className={styles.section_body}>
                    <p className={styles.title_section}>
                        {t("account_manage")}
                    </p>
                    <div className={styles.section}>
                        <div className={styles.section_link}>
                            <Link href="/component/account_user/edit_profile" className={styles.section_edit_profile}>{t("edit_profile")}</Link>
                            <Link href="" className={styles.section_change_password}>{t("change_password")}</Link>
                        </div>
                        <div className={styles.form}>
                            <div className={styles.old_password}>
                                <label htmlFor="old_password" className={styles.label_oldpassword}>{t("old_password")} <p className={styles.icon_start}>*</p></label>
                                <input id="old_password" type={showOldPassword ? "text" : "password"} className={styles.input}
                                value={oldPassword} onChange={(e)=>setOldPassword(e.target.value)}/>
                                <button
                                    type="button"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className={styles.toggle_button}
                                >
                                    <div className={styles.eye_password}>
                                        {showOldPassword && <VisibilityIcon></VisibilityIcon>}
                                        {!showOldPassword && <VisibilityOffIcon></VisibilityOffIcon>}
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
                                        {showNewPassword && <VisibilityIcon></VisibilityIcon>}
                                        {!showNewPassword && <VisibilityOffIcon></VisibilityOffIcon>}
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
                                        {showConfirmPassword && <VisibilityIcon></VisibilityIcon>}
                                        {!showConfirmPassword && <VisibilityOffIcon></VisibilityOffIcon>}
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
            </div>
            <ToastContainer />
        </div>
    )
}

export default ChangePassword;