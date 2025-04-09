"use client";

import styles from "../../../styles/edit_profile.module.css";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import dynamic from "next/dynamic";
import { useAuth } from "../../authProvider"; 
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

interface User {
    name: string;
    username: string;
    password: string;
    email: string;
    avatar?: string;
}

function EditProfilePage() {
    const t = useTranslations("edit_profile");
    
    const [nameUser, setNameUser] = useState("");
    const [inputName, setInputName] = useState("");
    const [inputEmail, setInputEmail] = useState("");
    const [password, setPassword] = useState("");
    const [avatar, setAvatar] = useState("");
    const [enterCode, setEnterCode] = useState("");
    const [isSend, setIsSend] = useState(false);

    const message1="Đã cập nhật email thành công với tài khoản có username: ";
    const message2="password: ";

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dtxm8ymr6/image/upload";
            const uploadPreset = "demo-upload";
            const form = new FormData();
            form.append("file", file);
            form.append("upload_preset", uploadPreset);

            const response = await fetch(cloudinaryUrl, {
                method: "POST",
                body: form,
            });

            const data = await response.json();
            if (data.secure_url) {
                setAvatar(data.secure_url);
            } else {
                toast.error(t("error_upload_img"));
                return;
            }
        }
    };

    const auth = useAuth() as {
        setUser(arg0: () => { name: string; avatar: string; }): unknown; user: User 
};

    const fetchUserData = () => {
        if (auth?.user?.name) {
            setNameUser(auth.user.name);
            setInputName(auth?.user.name);
            setPassword(auth?.user.password);
            setInputEmail(auth?.user.email);
            if(auth?.user.avatar)
                setAvatar(auth?.user.avatar);
        }
    }

    useEffect(() => {
        const token = Cookies.get("token");
        if(!token){
            window.location.href = "/component/account_user/login_user";
        }
       fetchUserData();
    },[auth?.user]);

    const handleSubmitSave = async () => {
        if (!inputName || !inputEmail) {
            toast.error(t("enter_full"));
            return;
        }
        else if(!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(inputEmail)) {
            toast.error(t("invalid_email"));
            return;
        }
        else if(inputEmail === auth.user.email && inputName === auth.user.name && avatar === auth.user.avatar){
            toast.error(t("no_inf_change"));
            return;
        }

        const token = Cookies.get("token");
        if(inputEmail === auth?.user.email){
            fetch("/api/manage_account/edit_profile", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    password: password,
                    inputName: inputName,
                    avatar: avatar,
                    inputEmail: inputEmail,
                    email: auth?.user.email
                }),
            })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error(`Lỗi HTTP: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                if (data.accessToken) {
                    Cookies.set("token", data.accessToken, { expires: 1 });
                }
                fetch("/api/verify_otp",{
                    method: "PUT",
                    body: JSON.stringify({oldEmail: auth.user.email, newEmail: inputEmail, username: auth?.user.username, password, message1, message2})
                })
                toast.success(t("update_successful"));
                setIsSend(false);
                auth.setUser(() => ({
                    name: inputName,
                    avatar: avatar,
                }));
            })
            .catch((error) => console.error(t("error_update"), error));
        }
        else{
            fetch("/api/send_otp",{
                method: "POST",
                body: JSON.stringify({email: inputEmail})
            })
            setIsSend(true);
        }
    };

    const cancelEnterCode = () => {
        setIsSend(false);
        setInputEmail(auth?.user.email);
    }

    const handleVerify = async() => {
        const responseVerify = await fetch("/api/verify_otp",{
            method: "POST",
            body: JSON.stringify({email: inputEmail, otp: enterCode, username: auth?.user.username, password, message1, message2})
        })
        if(!responseVerify.ok){
            return;
        }
        const token = Cookies.get("token");
        fetch("/api/manage_account/edit_profile", {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                password: password,
                inputName: inputName,
                avatar: avatar,
                inputEmail: inputEmail,
                email: auth?.user.email
            }),
        })
        .then(async (res) => {
            if (!res.ok) {
                throw new Error(`Lỗi HTTP: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            if (data.accessToken) {
                Cookies.set("token", data.accessToken, { expires: 1 });
            }
            fetch("/api/verify_otp",{
                method: "PUT",
                body: JSON.stringify({oldEmail: auth.user.email, newEmail: inputEmail, username: auth?.user.username, password, message1, message2})
            })
            toast.success(t("update_successful"));
            setIsSend(false);
            auth.setUser(() => ({
                name: inputName,
                avatar: avatar,
            }));
        })
        .catch((error) => console.error(t("error_update"), error));
    }

    const NavbarComponent = dynamic(() => import("@/single_file/navbar_user"), {ssr: false});
    return (
        <div className={styles.container}>
            <NavbarComponent />
            <div className={styles.content}>
                <div className={styles.sidebar}>
                    <p className={styles.sidebar_name_user}>{t("hi")} {nameUser} !</p>
                    <div className={styles.sidebar_account_manage}>
                        <div className={styles.icon_account_manage}>
                            <ManageAccountsIcon></ManageAccountsIcon>
                        </div>
                        <p className={styles.text_account_manage}>{t("account_manage")}</p>
                    </div>
                    <Link href="" className={styles.sidebar_edit_profile}>{t("edit_profile")}</Link>
                    <Link href="/component/account_user/change_password" className={styles.sidebar_change_password}>{t("change_password")}</Link>
                </div>
                <div className={styles.section}>
                    <p className={styles.title_section}>{t("account_manage")}</p>
                    <div className={styles.section_link}>
                        <Link href="" className={styles.section_edit_profile}>{t("edit_profile")}</Link>
                        <Link href="/component/account_user/change_password" className={styles.section_change_password}>{t("change_password")}</Link>
                    </div>
                    <p className={styles.title_link}>{t("edit_profile")}</p>
                    {!isSend && <div className={styles.form_section}>
                        <div className={styles.avt}>
                            <label htmlFor="avt" className={styles.label}>{t("avt")} <span className={styles.icon_start}>*</span></label>
                            <div onClick={handleImageClick}>
                                <img className={styles.upload_avt} src={avatar ? avatar : "/upload_avt.png"} alt="avt"/>
                            </div>
                            <input
                                ref={fileInputRef} 
                                id="avt"
                                type="file"
                                className={styles.choose_avt}
                                style={{ display: "none" }} 
                                accept="image/*"
                                onChange={handleFileChange} 
                            />
                        </div>
                        <div className={styles.name}>
                            <label htmlFor="name" className={styles.label}>{t("name")} <span className={styles.icon_start}>*</span></label>
                            <input id="name" type="text" className={styles.input}
                            value={inputName} onChange={(e) => setInputName(e.target.value)} />
                        </div>
                        <div className={styles.name}>
                            <label htmlFor="email" className={styles.label}>{t("email")} <span className={styles.icon_start}>*</span></label>
                            <input id="email" type="email" className={styles.input}
                            value={inputEmail} onChange={(e) => setInputEmail(e.target.value)} />
                        </div>
                        <div className={styles.section_btn}>
                            <button className={styles.btn_save} onClick={handleSubmitSave}>{t("btn_save")}</button>
                        </div>
                        <ToastContainer />
                    </div>
                    }
                    {isSend && <div>
                        <div className={styles.code}>
                            <label htmlFor="code" className={styles.label}>{t("code")} <span className={styles.icon_start}>*</span></label>
                            <input id="code" type="text" className={styles.input}
                            value={enterCode} onChange={(e) => setEnterCode(e.target.value)} />
                        </div>
                        <div className={styles.btn_group}>
                            <button className={styles.btn_cancel} onClick={cancelEnterCode}>
                                {t("btn_cancel")}
                            </button>
                            <button className={styles.btn_update} onClick={handleVerify}>
                                {t("btn_update")}
                            </button>
                        </div>
                    </div>
                    }
                </div>
            </div>
        </div>
    );
}

export default EditProfilePage;
