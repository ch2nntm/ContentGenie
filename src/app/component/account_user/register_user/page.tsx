"use client";
import Image from "next/image";
import styles from "../../../styles/register.module.css";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { mutate } from "swr";
import { useTranslations } from "next-intl";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

function Register() {
    const [name, setName] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const router = useRouter();
    const t = useTranslations("register");
    const noti_toast = useTranslations("toast");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn form reload lại trang
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if(!name || !password || !confirmPassword){
            toast.error(noti_toast('enter_not_full'));
            return;
        }
        else{
            if(password != confirmPassword){
                toast.error(noti_toast('password_not_match'));
                return;
            }
            else if(!passwordRegex.test(password)) {
                toast.error(t("password_not_format"));
                return;
            } 
        }
        try{
            fetch("/api/manage_account/register",{
                method: "POST",
                headers:{
                    Accept: "application/json, text/plain,*/*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({name, username, password}),
            })
            .then((res) => res.json())
            .then((res) => {
                if(res.message){
                    console.log("Res: ",res);
                    mutate("/api/manage_account");
                    router.push("/component/account_user/login_user");
                    // redirect("/component/manage_account/login"); //Server Component
                }
                else if(res.error){
                    toast.error(noti_toast('account_exists'));
                }
            })
        } catch (error) {
            toast.error(noti_toast('error'));
        }
    };
    
    return(
        <>
            <div className={styles.container}>
                <div className={styles.img_main}>
                    <Image src="/main_login_register.png" alt="Icon" fill></Image>
                </div>
                <div className={styles.content}>
                    <div className={styles.title}>
                        <div className={styles.img_sub}>
                            <Image src="/sub_login_register.png" alt="Icon" fill></Image>
                        </div>
                        <h1 className={styles.text_main}>ContentGenie</h1>
                    </div>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <label className={styles.label} htmlFor="name">{t("label_name")}</label>
                        <input
                            type="text"
                            id="name"
                            placeholder={t("input_name")}
                            value={name}
                            className={styles.input}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <label className={styles.label} htmlFor="username">{t("label_username")}</label>
                        <input
                            type="text"
                            id="username"
                            placeholder={t("input_username")}
                            value={username}
                            className={styles.input}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <label className={styles.label} htmlFor="password">{t("label_password")}</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            placeholder={t("input_password")}
                            value={password}
                            className={styles.input_password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={styles.toggle_button_password}
                        >
                            <div className={styles.eye_password}>
                                {showPassword && <VisibilityIcon></VisibilityIcon>}
                                {!showPassword && <VisibilityOffIcon></VisibilityOffIcon>}
                            </div>
                        </button>
                        <label className={styles.label_confirm_password} htmlFor="confirmpassword">{t("label_confirm_password")}</label>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmpassword"
                            placeholder={t("input_confirm_password")}
                            value={confirmPassword}
                            className={styles.input}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className={styles.toggle_button_confirm_password}
                        >
                            <div className={styles.eye_confirm_password}>
                                {showConfirmPassword && <VisibilityIcon></VisibilityIcon>}
                                {!showConfirmPassword && <VisibilityOffIcon></VisibilityOffIcon>}
                            </div>
                        </button>
                        <button type="submit" className={styles.buttonRegister}>
                            {t("create_account")}
                        </button>
                    </form>
                    <ToastContainer />
                    <div className={styles.login}>
                        <p className={styles.text_login}>{t("have_account")}</p>
                        <Link href="./login_user" className={styles.btn_login}>
                            {t("signin")}
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Register;
