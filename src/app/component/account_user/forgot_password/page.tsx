"use client";
import { useState } from "react";
import styles from "../forgot_password/forgot_password.module.css";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useTranslations } from "next-intl";

function ForgotPassword(){
    const t = useTranslations("forgot_password");
    const [email, setEmail] = useState<string>("");
    const [code, setCode] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isClickForgotPassword, setIsClickForgotPassword] = useState(false);
    const [isClickSendCode, setIsClickSendCode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoadingSendEmail, setIsLoadingSendEmail] = useState(false);
    const [isLoadingSendCode, setIsLoadingSendCode] = useState(false);
    const [isLoadingResetPassword, setIsLoadingResetPassword] = useState(false);

    const router = useRouter();

    const hanldeCancelForgotPassword = () => {
        router.push("/component/account_user/login_user");
    }

    const hanldeCancelResetPassword = () => {
        setIsClickSendCode(false);
        setIsClickForgotPassword(true);
        setCode("");
    }

    const hanldeCancelSendCode = () => {
        setIsClickSendCode(false);
        setIsClickForgotPassword(false);
        setEmail("");
    }

    const handleSendCode = async() => {
        if(!code){
            toast.error(t("code_not_full"));
            return;
        }
        setIsLoadingSendCode(true);
        const response = await fetch("/api/verify_otp",{
            method: "POST",
            body: JSON.stringify({email, otp: code, password: "check", message1: t("message1"), message2: t("message2"), checkOnly: true})
        })
        .finally(() => {
            setIsLoadingSendCode(false);
        });
        if(response.ok){
            setIsClickSendCode(true);
            toast.success(t("code_success"));
        }
        else{
            toast.error(t("error_code"));
        }
    }

    const handleResendCode = () => {
        fetch("/api/send_otp",{
            method: "POST",
            body: JSON.stringify({email})
        });
        toast.success(t("resend_code_again"));
    }

    const handleForgotPassword = () => {
        if(!email){
            toast.error(t("enter_full"));
            return;
        }
        else if(!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            toast.error(t("invalid_email"));
            return;
        }
        try{
            setIsLoadingSendEmail(true);
            fetch("/api/manage_account/forgot_password",{
                method: "POST",
                headers:{
                    Accept: "application/json, text/plain,*/*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email}),
            })
            .then((res) => res.json())
            .then((res) => {
                if(res.status === "success"){
                    fetch("/api/send_otp",{
                        method: "POST",
                        body: JSON.stringify({email})
                    })
                    .then((res) => res.json())
                    .then((res) => {
                        if(res.status === "success"){
                            setIsClickForgotPassword(true);
                            setCode("");
                            toast.success(t("send_code"));
                        }
                        else{
                            toast.error(t("error_internet"));
                        }
                    }
                    );
                }
                else{
                    toast.error(t("email_wrong"));
                }
            })
            .finally(() => {
                setIsLoadingSendEmail(false);
            });
        } catch (error) {
            console.error(t("error_register"), error);
        }
    }

    const handleResetPassword = () => {
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if(password != confirmPassword){
            toast.error(t("password_not_match"));
            return;
        }
        else if (!passwordRegex.test(password)) {
            toast.error(t("password_not_format"));
            return;
        }
        else{
            try{
                setIsLoadingResetPassword(true);
                fetch("/api/manage_account/forgot_password",{
                    method: "PUT",
                    headers:{
                        Accept: "application/json, text/plain,*/*",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({password, email}),
                })
                .then((res) => res.json())
                .then((res) => {
                    if(res.status === "success"){
                        fetch("/api/verify_otp",{
                            method: "PUT",
                            body: JSON.stringify({oldEmail: "Check", newEmail: email, password, message1: t("message1"), message2: t("message2")})
                        })
                        router.push("/component/account_user/login_user");
                    }
                    else if(res.status === "error"){
                        toast.error(t("password_match"));
                    }
                })
                .finally(() => {
                    setIsLoadingResetPassword(false);
                });
            } catch (error) {
                console.error(t("error_register"), error);
            }
        }
    }

    return(
        <>
            <div className={styles.container}>
                <div className={styles.container_forgot_password} style={{display: !isClickForgotPassword ? "block" : "none"}}>
                    <p className={styles.title}>
                        {t("title")}
                    </p>
                    <p className={styles.subtitle}>{t("subtitle_forgot")}</p>
                    <div className={styles.input_username}>
                        <input id="email" placeholder={t("input_email")} onChange={(e) => setEmail(e.target.value)} value={email} type="text" className={styles.input} />
                    </div>
                    <div className={styles.div_btn}>
                        <button onClick={handleForgotPassword} type="button" className={styles.btn_forgot_password}>
                            {isLoadingSendEmail 
                                ? 
                                    <div className={styles.loading}>
                                        <div className={styles.spinner}></div>
                                    </div> 
                            : ''}
                            {t("send_reset_link")}
                        </button>
                        <button onClick={hanldeCancelForgotPassword} type="button" className={styles.btn_cancel}>{t("back_siginin")}</button>
                    </div>
                </div>

                <div className={styles.container_code} style={{display: isClickForgotPassword && !isClickSendCode ? "block" : "none"}}>
                    <p className={styles.title}>
                        {t("title_code")}
                    </p>
                    <div className={styles.subtitle_verify}>
                        <p>{t("subtitle_code")}</p>
                    </div>
                    <div className={styles.input_code}>
                        <input id="code" placeholder={t("code")} onChange={(e) => setCode(e.target.value)} value={code} type="text" className={styles.input} />
                    </div>
                    <div className={styles.div_btn}>
                        <button onClick={handleSendCode} type="button" className={styles.btn_verify}>
                            {isLoadingSendCode 
                                ? 
                                    <div className={styles.loading}>
                                        <div className={styles.spinner}></div>
                                    </div> 
                            : ''}
                            {t("send_code")}
                        </button>
                    </div>
                    <div className={styles.link_verify}>
                        <button onClick={hanldeCancelSendCode} type="button" className={styles.btn_cancel_verify}>{t("btn_cancel_verify")}</button>
                        <button onClick={handleResendCode} type="button" className={styles.btn_resend_code}>{t("resend_code")}</button>
                    </div>
                </div>

                <div className={styles.container_reset_password} style={{display: isClickForgotPassword && isClickSendCode ? "block" : "none"}}>
                        <p className={styles.title}>
                            {t("title_reset_password")}
                        </p>
                        <p className={styles.subtitle}>
                            {t("subtitle_reset_password")}
                        </p>
                        <div className={styles.input_password}>
                            <input id="password" placeholder={t("password")} onChange={(e) => setPassword(e.target.value)} value={password}
                             type={showPassword ? "text" : "password"}  className={styles.input} />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={styles.toggle_button}
                            >
                                <div className={styles.eye_password}>
                                    {!showPassword && <VisibilityIcon></VisibilityIcon>}
                                    {showPassword && <VisibilityOffIcon></VisibilityOffIcon>}
                                </div>
                            </button>
                        </div>
                        <div className={styles.input_confirm_password}>
                            <input id="confirm_password" placeholder={t("confirm_password")} onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} 
                                type={showConfirmPassword ? "text" : "password"}  className={styles.input} />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className={styles.toggle_button}
                            >
                                <div className={styles.eye_password}>
                                    {!showConfirmPassword && <VisibilityIcon></VisibilityIcon>}
                                    {showConfirmPassword && <VisibilityOffIcon></VisibilityOffIcon>}
                                </div>
                            </button>
                        </div>
                        <div className={styles.div_btn}>
                            <button onClick={handleResetPassword} type="button" className={styles.btn_reset_password}>
                                {isLoadingResetPassword 
                                    ? 
                                        <div className={styles.loading}>
                                            <div className={styles.spinner}></div>
                                        </div> 
                                : ''}
                                {t("btn_reset_password")}
                            </button>
                            <button onClick={hanldeCancelResetPassword} type="button" className={styles.btn_cancel_reset}>{t("btn_cancel_verify")}</button>
                        </div>
                </div>
            </div>
            <ToastContainer/>
        </>
    )
}

export default ForgotPassword;