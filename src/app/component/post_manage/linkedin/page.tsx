"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../../../styles/linkedIn.module.css';

function LinkedIn() {
    const [linkedinCode, setLinkedinCode] = useState("");
    const searchParams = useSearchParams();
    const router = useRouter();
    
    useEffect(() => {
        const codeFromUrl = searchParams.get("code");
        if (codeFromUrl && !linkedinCode) {
            console.log("Found LinkedIn Code in URL:", codeFromUrl);
            saveLinkedInCode(codeFromUrl);
        }
        console.log("Not Found LinkedIn Code in URL");
    }, []);

    const saveLinkedInCode = async (code: string) => {
        try {
            console.log("Sending request to backend...");
            const res = await fetch("/api/auth/linkedin/callback?code=" + code, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-store", 
            });

            if (!res.ok) {
                throw new Error(`Server responded with ${res.status}`);
            }

            const data = await res.json();
            console.log("Saved LinkedIn Code:", data);
            setLinkedinCode(data.code);

            setTimeout(() => {
                router.push("/post_manage/linkedin");
            }, 1000);
        } catch (error) {
            console.error("Error saving LinkedIn code:", error);
        }
    };

    const handleLogin = async () => {
        try {
            console.log("Fetching LinkedIn login URL...");
            const res = await fetch("/api/linkedin_social/get_code", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                throw new Error(`Server responded with ${res.status}`);
            }

            const data = await res.json();
            console.log("Redirecting to:", data.url);
            window.location.href = data.url;
        } catch (error) {
            console.error("Error during LinkedIn login:", error);
        }
    };

    return (
        <>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>LinkedIn</h1>
                </div>
                <div className={styles.content}>
                    <p>LinkedIn</p>
                    {linkedinCode && <p>Mã LinkedIn: {linkedinCode}</p>}
                </div>
            </div>
            <button onClick={handleLogin}>Đăng nhập với LinkedIn</button>
        </>
    );
}

export default LinkedIn;
