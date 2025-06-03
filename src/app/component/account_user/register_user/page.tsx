"use client";
import Image from "next/image";
import styles from "../register_user/register.module.css";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { useTranslations } from "next-intl";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

function Register() {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const t = useTranslations("register");
    const noti_toast = useTranslations("toast");

    const [isEnterCode,setIsEnterCode]=useState(false);
    const [enterCode, setEnterCode]=useState("");
    const message1 = t("message1");
    const message2 = t("message2");
    const subject=t("subject");
    const text=t("text");
    const ex = t("ex");

    const sendEmail = async () => {
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if(!name || !email || !password || !confirmPassword){
            toast.error(noti_toast('enter_not_full'));
            return;
        }
        else if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            toast.error(t("invalid_email"));
            return;
        }
        else if(email.length > 50){
            toast.error(t("email_too_long"));
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
            else if(password.length > 20){
                toast.error(t("password_too_long"));
                return;
            }
        }
        setIsLoading(true);
        const responseEmail = await fetch(`/api/manage_account/register?email=${email}`,{
            method: "GET",
        })
        .finally(()=>{
            setIsLoading(false);
        });
        
        setIsLoading(true);
        if(responseEmail.ok){
            fetch("/api/send_otp",{
                method: "POST",
                body: JSON.stringify({email, subject, text, ex})
            })
            .then((data)=>{
                if(data.status === 200){
                    toast.success(t("send_code_successful"));
                    setIsEnterCode(true);
                }
                else
                    toast.error(t("send_code_failed"));
            })
            .finally(()=>{
                setIsLoading(false);
            });
        }
        else{
            toast.error(t("exist_account"));
        }
    };

    const cancelEnterCode = () => {
        setIsEnterCode(false);
        setEnterCode("");
    }

    const sendCode = async () => {
        const responseNoti = await fetch("/api/verify_otp",{
            method: "POST",
            body: JSON.stringify({email, otp: enterCode, password, message1, message2, checkOnly: false})
        })
        if(responseNoti.ok){
            fetch("/api/manage_account/register",{
                method: "POST",
                headers:{
                    Accept: "application/json, text/plain,*/*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({name, email, password}),
            })
            .then((res) => res.json())
            .then((res) => {
                if(res.message){
                    router.push("/component/account_user/login_user");
                }
                else if(res.error){
                    toast.error(noti_toast('account_exists'));
                }
            })
        }
        else{
            toast.error(t("wrong_code"));
        }
    }

    const handleResendCode = () => {
        fetch("/api/send_otp",{
            method: "POST",
            body: JSON.stringify({email, subject, text, ex})
        }).then((data)=>{
            if(data.status === 200){
                toast.success(t("resend_code_again"));
            }
            else
                toast.error(t("resend_code_failed"));
        });
    }
    
    return(
        <>
            <div className={styles.container}>
                <div className={styles.img_main}>
                    <Image src="/main_login_register.png" alt="Icon" fill></Image>
                </div>
                <div className={!isEnterCode ? styles.content : styles.content_verify}>
                    <Link href="/" className={styles.title}>
                        <div className={styles.img_sub}>
                            <Image src="/sub_login_register.png" alt="Icon" fill></Image>
                        </div>
                        <h1 className={styles.text_main}>ContentGenie</h1>
                    </Link>
                    {!isEnterCode && 
                    <div>
                        <form className={styles.form}>
                            <input
                                type="text"
                                id="name"
                                placeholder={t("input_name")}
                                value={name}
                                className={styles.input}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <input
                                type="email"
                                id="email"
                                placeholder={t("input_email")}
                                value={email}
                                className={styles.input}
                                onChange={(e) => setEmail(e.target.value)}
                            />
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
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmpassword"
                                placeholder={t("input_confirm_password")}
                                value={confirmPassword}
                                className={styles.input_confirm}
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
                            <button type="button" onClick={sendEmail} className={styles.buttonRegister}>
                                {isLoading 
                                ? 
                                    <div className={styles.loading}>
                                        <div className={styles.spinner}></div>
                                    </div> 
                                : ''}
                                {t("create_account")}
                            </button>
                        </form>
                        <div className={styles.login}>
                            <p className={styles.text_login}>{t("have_account")}</p>
                            <Link href="./login_user" className={styles.btn_login}>
                                {t("signin")}
                            </Link>
                        </div>
                    </div>
                    }
                    {isEnterCode && 
                        <div className={styles.container_enter_code}>
                            <div>
                                <div className={styles.form_group}>
                                    <input className={styles.input} placeholder={t("placeholder_code")}
                                        type='text'
                                        id='code'
                                        value={enterCode}
                                        onChange={(e) => setEnterCode(e.target.value)}
                                        />
                                </div>
                            </div>
                            <div className={styles.div_resend_code}>
                                <button onClick={handleResendCode} type="button" className={styles.btn_resend_code}>{t("resend_code")}</button>
                            </div>
                            <div className={styles.btn_group}>
                                <button className={styles.btn_cancel} onClick={cancelEnterCode}>
                                    {t("btn_cancel")}
                                </button>
                                <button className={styles.btn_add} onClick={sendCode}>
                                    {t("btn_add")}
                                </button>
                            </div>
                        </div>
                    }
                    <ToastContainer />
                </div>
            </div>
        </>
    )
}

export default Register;
