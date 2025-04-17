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
    // const [code, setCode] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isClickForgotPassword, setIsClickForgotPassword] = useState(false);
    // const [isClickSendCode, setIsClickSendCode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const router = useRouter();

    const hanldeCancelForgotPassword = () => {
        router.push("/component/account_user/login_user");
    }

    const hanldeCancelResetPassword = () => {
        // setIsClickSendCode(false);
        setIsClickForgotPassword(false);
    }

    // const hanldeCancelSendCode = () => {
    //     setIsClickForgotPassword(false);
    //     setEmail("");
    // }

    // const handleSendCode = async() => {
    //     if(!code){
    //         toast.error(t("code_not_full"));
    //         return;
    //     }
    //     const response = await fetch("/api/verify_otp",{
    //         method: "POST",
    //         body: JSON.stringify({email, otp: code, password: "check", message1: t("message1"), message2: t("message2"), checkOnly: true})
    //     })
    //     if(response.ok)
    //         setIsClickSendCode(true);
    //     else{
    //         toast.error(t("error_code"));
    //     }
    // }

    // const handleResendCode = () => {
    //     fetch("/api/send_otp",{
    //         method: "POST",
    //         body: JSON.stringify({email})
    //     });
    //     toast.success(t("resend_code_again"));
    // }

    const handleForgotPassword = () => {
        if(!email){
            toast.error(t("enter_full"));
            return;
        }
        try{
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
                if(res.message){
                    setIsClickForgotPassword(true);
                    // setCode("");
                    // fetch("/api/send_otp",{
                    //     method: "POST",
                    //     body: JSON.stringify({email})
                    // })
                    // .then(()=>{
                    //     setIsClickForgotPassword(true);
                    // });
                }
                else if(res.error){
                    toast.error(t("email_wrong"));
                }
            })
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
                    if(res.message){
                        fetch("/api/verify_otp",{
                            method: "PUT",
                            body: JSON.stringify({oldEmail: "Check", newEmail: email, password, message1: t("message1"), message2: t("message2")})
                        })
                        router.push("/component/account_user/login_user");
                    }
                    else if(res.status === 202){
                        toast.error(t("password_match"));
                    }
                })
            } catch (error) {
                console.error(t("error_register"), error);
            }
        }
    }

    return(
        <>
            <div className={styles.container}>
                <div className={styles.container_forgot_password} style={{display: isClickForgotPassword ? "none" : "block"}}>
                    <p className={styles.title}>
                        {t("title")}
                    </p>
                    <div className={styles.input_username}>
                        <label htmlFor="email" className={styles.label}>
                            {t("email")}
                            <p className={styles.important}>*</p>
                        </label>
                        <input id="email" onChange={(e) => setEmail(e.target.value)} value={email} type="text" className={styles.input} />
                    </div>
                    <button onClick={hanldeCancelForgotPassword} type="button" className={styles.btn_cancel}>{t("btn_cancel")}</button>
                    <button onClick={handleForgotPassword} type="button" className={styles.btn_forgot_password}>{t("title")}</button>
                </div>

                {/* <div className={styles.container_code} style={{display: isClickForgotPassword && !isClickSendCode ? "block" : "none"}}>
                    <p className={styles.title}>
                        {t("title_code")}
                    </p>
                    <div className={styles.input_code}>
                        <label htmlFor="code" className={styles.label}>
                            {t("code")}
                            <p className={styles.important}>*</p>
                        </label>
                        <input id="code" onChange={(e) => setCode(e.target.value)} value={code} type="text" className={styles.input} />
                    </div>
                    <div className={styles.div_resend_code}>
                        <button onClick={handleResendCode} type="button" className={styles.btn_resend_code}>{t("resend_code")}</button>
                    </div>
                    <button onClick={hanldeCancelSendCode} type="button" className={styles.btn_cancel}>{t("btn_cancel")}</button>
                    <button onClick={handleSendCode} type="button" className={styles.btn_forgot_password}>{t("send_code")}</button>
                </div> */}

                <div className={styles.container_reset_password} style={{display: isClickForgotPassword ? "block" : "none"}}>
                    <p className={styles.title}>
                            {t("reset_password")}
                        </p>
                        <div className={styles.input_password}>
                            <label htmlFor="password" className={styles.label}>
                                {t("password")}
                                <p className={styles.important}>*</p>
                            </label>
                            <input id="password" onChange={(e) => setPassword(e.target.value)} value={password}
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
                            <label htmlFor="confirm_password" className={styles.label}>
                                {t("confirm_password")}
                                <p className={styles.important}>*</p>
                            </label>
                            <input id="confirm_password" onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} 
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
                        <button onClick={hanldeCancelResetPassword} type="button" className={styles.btn_cancel}>{t("btn_cancel")}</button>
                        <button onClick={handleResetPassword} type="button" className={styles.btn_reset_password}>{t("reset_password")}</button>
                </div>
            </div>
            <ToastContainer/>
        </>
    )
}

export default ForgotPassword;