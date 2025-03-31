"use client";
import Image from "next/image";
import styles from "../../../styles/login.module.css";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { signIn, useSession} from "next-auth/react";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';

function Login() {
    const router = useRouter();
    const {data: session, status} = useSession();

    const t = useTranslations("login");  
    const noti_toast = useTranslations("toast"); 
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(()=>{
        if(session?.accessToken){
            Cookies.set("token", session.accessToken, {expires: 1, sameSite: "Lax"});
            router.push("/");
        }
        document.title = t("title_page");
    },[session, status]);

    const handleGoogleSignIn = async () => {
        signIn("google");
    }
    

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); 
        if (!email || !password) {
            toast.error(noti_toast("enter_not_full"));
            return;
        }
        else if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            toast.error(t("invalid_email"));
            return;
        }
        else if(!/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)){
            toast.error(t("invalid_password"));
            return;
        }
        fetch("/api/manage_account/login", {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain,*/*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.message) {
                Cookies.set("token", data.token, { expires: 1, sameSite: "Lax" });
    
                fetch("/api/manage_account/login", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${data.token}`,
                    },
                })
                .then((res) => res.json())
                .then((data) => {
                    if (data.user) {
                        router.push("/");
                    }
                });
            } else {
                toast.error(noti_toast("wrong_account"));
            }
        });
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
                        <label className={styles.label} htmlFor="email">{t("label_email")}</label>
                        <input
                            type="email"
                            id="email"
                            placeholder={t("input_username")}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                        />
                        <label className={styles.label} htmlFor="password">{t("label_password")}</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            placeholder={t("input_password")}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input_password}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={styles.toggle_button}
                        >
                            <div className={styles.eye_password}>
                                {showPassword && <VisibilityIcon></VisibilityIcon>}
                                {!showPassword && <VisibilityOffIcon></VisibilityOffIcon>}
                            </div>
                        </button>
                        <Link className={styles.forgot_password} href="/component/account_user/forgot_password">{t("forgot_password")}</Link>
                        <button type="submit" className={styles.buttonLogin}>
                            {t("signin")}
                        </button>
                    </form>
                    <ToastContainer />
                    <div className={styles.register}>
                        <p className={styles.text_register}>{t("have_account")}</p>
                        <Link href="./register_user" className={styles.btn_register}>{t("signup")}</Link>
                    </div>
                    <button className={styles.buttonLoginGoogle} onClick={handleGoogleSignIn}>
                        <div className={styles.google}>
                            <GoogleIcon></GoogleIcon>
                        </div>
                        {t("signinGG")}
                    </button>
                </div>
            </div>
        </>
    )
}

export default Login;
