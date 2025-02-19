"use client";
import Image from "next/image";
import styles from "../../../styles/login.module.css";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

function Login() {
    const router = useRouter();

    const t = useTranslations("login");  
    const noti_toast = useTranslations("toast"); 

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    // const [user, setUser] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // useEffect(() => {
    //     const token = Cookies.get("token");
    //     if (token) {
    //         fetch("/api/manage_account/login", {
    //             method: "GET",
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //             },
    //         })
    //         .then(async (res) => {
    //             if (!res.ok) {
    //                 throw new Error(`Lỗi HTTP: ${res}`);
    //             }
    //             const contentType = res.headers.get("content-type");
    //             if (!contentType || !contentType.includes("application/json")) {
    //                 throw new Error("Phản hồi không phải JSON hợp lệ");
    //             }
    //             return res.json();
    //         })
    //         .then((data) => {
    //             if (data.user) {
    //                 setUser(data.user.name);
    //             }
    //         })
    //         .catch((error) => console.error("Lỗi lấy thông tin user:", error));
    //     }
    // }, []);
    

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn form reload lại trang
        if(!username || !password){
            toast.error(noti_toast("enter_not_full"));
            return;
        }
        fetch("/api/manage_account/login",{
            method: "POST",
            headers:{
                Accept: "application/json, text/plain,*/*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({username, password}),
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.message) {
                Cookies.set("token", data.token, { expires: 1, sameSite: "Lax" });
                router.push("/");
            } else {
                toast.error(noti_toast("wrong_account"));
            }
        })
    };
    
    // const handleLogout = async () => {
    //     try {
    //         // Kiểm tra token trước khi gửi request logout
    //         const token = Cookies.get("token");
    
    //         if (!token) {
    //             toast.error(noti_toast("pls_login"));
    //             return;
    //         }
    
    //         const res = await fetch("/api/manage_account/logout", { method: "POST" });
    
    //         if (res) {
    //             Cookies.remove("token", { path: "/" }); // Xóa token phía client
    //             // setUser(null); // Xóa thông tin user
    //             toast.success(noti_toast("signout_success"));
    //         } else {
    //             toast.error(noti_toast("signout_fail"));
    //         }
    //     } catch (error) {
    //         toast.error(noti_toast("error"));
    //     }
    // };


    return(
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
                    <label className={styles.label} htmlFor="username">{t("label_username")}</label>
                    <input
                        type="text"
                        id="username"
                        placeholder={t("input_username")}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                            <Image src={showPassword ? "/fa_eye_slash.png" : "/fa_eye.png"} alt="Eye Password" fill></Image>
                        </div>
                    </button>
                    <button type="submit" className={styles.buttonLogin}>
                        {t("signin")}
                    </button>
                </form>
                <ToastContainer />
                <div className={styles.register}>
                    <p className={styles.text_register}>{t("have_account")}</p>
                    <Link href="./register" className={styles.btn_register}>{t("signup")}</Link>
                </div>
                <button className={styles.buttonLoginGoogle}>
                    <div className={styles.google}>
                        <Image src="/icon_GG.svg" alt="Icon" fill></Image>
                    </div>
                    {t("signinGG")}
                </button>
            </div>
        </div>
    )
}

export default Login;
