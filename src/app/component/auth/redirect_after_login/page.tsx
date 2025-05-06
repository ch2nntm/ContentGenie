"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Cookies from "js-cookie";
import styles from "../redirect_after_login/redirect_after_login.module.css";
export default function RedirectAfterLogin() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
        if (session?.accessToken && session?.user?.role === 1) {
            Cookies.set("token", session.accessToken, { expires: 1, sameSite: "Lax" });
            router.push("/component/admin/dashboard");
        }
        else if(session?.accessToken && session?.user?.role === 0) {
            Cookies.set("token", session.accessToken, { expires: 1, sameSite: "Lax" });
            router.push("/component/post_manage/list_post_user");
        }
    }
  }, [session, status, router]);

  return (
    <div className={styles.loading}>
        <div className={styles.spinner}></div>
        Loading...
    </div>
  );
}
