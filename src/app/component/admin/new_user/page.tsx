"use client"
import React, {useEffect, useState} from 'react';
import styles from "../../../styles/new_user.module.css";
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';

const SendEmailForm = () => {
    const t = useTranslations("new_user");
    const router = useRouter();

    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [isEnterCode,setIsEnterCode]=useState(false);
    const [enterCode, setEnterCode]=useState("");
    const message1 = t("message1");
    const message2 = t("message2");

    const cancelEnterCode = () => {
        setIsEnterCode(false);
    }

    const sendCode = async () => {
        const responseNoti = await fetch("http://localhost:3000/api/verify_otp",{
            method: "POST",
            body: JSON.stringify({email, otp: enterCode, username, password, message1, message2})
        })
        console.log("Code: ",enterCode);
        if(responseNoti.ok){
            fetch("http://localhost:3000/api/manage_account/add_new_user",{
                method: "POST",
                body: JSON.stringify({name, username, password, email})
            })
            toast.success(t("add_successful"));
            router.push("/component/admin/dashboard");
        }
        else{
            toast.error(t("wrong_code"));
        }
    }

    const sendEmail = async() => {
        if(!name && !email){
            toast.error(t("enter_full"));
            return;
        }
        else if(!name){
            toast.error(t("enter_name"));
            return;
        }
        else if(!email){
            toast.error(t("enter_email"));
            return;
        }
        else if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            toast.error(t("invalid_email"));
            return;
        }

        const responseEmail = await fetch(`http://localhost:3000/api/manage_account/add_new_user?email=${email}`,{
            method: "GET"
        });
        
        if(responseEmail.ok){
            fetch("http://localhost:3000/api/send_otp",{
                method: "POST",
                body: JSON.stringify({email})
            });
            setIsEnterCode(true);
        }
        else{
            toast.error(t("exist_account"));
        }
    };

    useEffect(()=>{
        const normalized = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "");

        const randomNumber = Math.floor(100 + Math.random() * 900);
        
        setUsername(normalized+randomNumber);
        setPassword(normalized+randomNumber+"@");
    },[name]);


    return (
        <div className={styles.container_new_user}>
            {!isEnterCode && <div className={styles.container}>
                <div className={styles.title}>
                    <p>{t("btn_add_new")}</p>
                </div>
                <div>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor='name'>{t("name")}:</label>
                        <input className={styles.input} placeholder={t("placeholder_name")}
                            type='text'
                            id='name'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            />
                    </div>
                </div>
                <div >
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor='email'>{t("email")}:</label>
                        <input className={styles.input} placeholder={t("placeholder_email")}
                            type='email'
                            id='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                </div>
                <div className={styles.btn_group}>
                    <Link className={styles.btn_cancel} href="/component/admin/dashboard">
                        {t("btn_cancel")}
                    </Link>
                    <button className={styles.btn_add} onClick={sendEmail}>
                        {t("btn_send")}
                    </button>
                </div>
            </div>
            }
            {isEnterCode && 
                <div className={styles.container_enter_code}>
                    <div className={styles.title}>
                        <p>{t("enter_code")}</p>
                    </div>
                    <div>
                        <div className={styles.form_group}>
                            <label className={styles.label} htmlFor='code'>{t("code")}:</label>
                            <input className={styles.input} placeholder={t("placeholder_code")}
                                type='text'
                                id='code'
                                value={enterCode}
                                onChange={(e) => setEnterCode(e.target.value)}
                                />
                        </div>
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
            <ToastContainer/>
        </div>
    );
};

export default SendEmailForm;