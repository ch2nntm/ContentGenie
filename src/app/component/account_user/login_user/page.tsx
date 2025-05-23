"use client";
import Image from "next/image";
import styles from "../login_user/login.module.css";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { signIn} from "next-auth/react";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';

function Login() {
    const router = useRouter();

    const t = useTranslations("login");  
    const noti_toast = useTranslations("toast"); 
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        signIn("google", { callbackUrl: "/component/auth/redirect_after_login" });
      };      
    
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
        setIsLoading(true);
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
            if (data.status === "success") {
                Cookies.set("token", data.token, { expires: 1, sameSite: "Lax" });
    
                fetch("/api/manage_account/login", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${data.token}`,
                    },
                })
                .then((res) => res.json())
                .then((data) => {
                    if(data.user.role === 1){
                        router.push("/component/admin/dashboard");
                    }
                    else if (data.user.role === 0) {
                        router.push("/component/post_manage/list_post_user");
                    }
                });
            } else {
                if(data.message === "Email not found!")
                    toast.error(noti_toast("email_not_found"));
                else if(data.message === "Wrong password!")
                    toast.error(noti_toast("wrong_account"));
            }
        }).finally(() => {
            setIsLoading(false);
        });
    };

    return(
        <>
            <div className={styles.container}>
                <div className={styles.img_main}>
                    <Image src="/main_login_register.png" alt="Icon" fill></Image>
                </div>
                <div className={styles.content}>
                    <Link href="/" className={styles.title}>
                        <div className={styles.img_sub}>
                            <Image src="/sub_login_register.png" alt="Icon" fill></Image>
                        </div>
                        <h1 className={styles.text_main}>ContentGenie</h1>
                    </Link>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <input
                            type="email"
                            id="email"
                            placeholder={t("input_email")}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                        />
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
                            {isLoading 
                            ? 
                                <div className={styles.loading}>
                                    <div className={styles.spinner}></div>
                                </div> 
                            : ''}
                            {t("signin")}
                        </button>
                    </form>
                    <ToastContainer />
                    <div className={styles.or_submitgoogle}>{t("or_submitgoogle")}</div>
                    <button className={styles.buttonLoginGoogle} onClick={handleGoogleSignIn}>
                        <div className={styles.google}>
                            <GoogleIcon className={styles.icon_goggle}/>
                        </div>
                        {t("signinGG")}
                    </button>
                    <div className={styles.register}>
                        <p className={styles.text_register}>{t("have_account")}</p>
                        <Link href="./register_user" className={styles.btn_register}>{t("signup")}</Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login;
