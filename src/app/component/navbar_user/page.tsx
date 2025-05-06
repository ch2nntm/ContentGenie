"use client";
import useSWR from "swr";
import styles from "../navbar_user/navbar_user.module.css";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { signOut } from "next-auth/react";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import SearchIcon from "@mui/icons-material/Search";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import MarkAsUnreadIcon from "@mui/icons-material/MarkAsUnread";
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocalPostOfficeIcon from '@mui/icons-material/LocalPostOffice';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';

const fetcher = (url: string) => {
    const token = Cookies.get("token");
    return fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then((res) => {
        if (!res.ok) {
            throw new Error("HTTP error");
        }
        return res.json();
    });
};

function NavbarUser() {
    const t = useTranslations("navbar_user");
    const router = useRouter();
    const pathname = usePathname();  

    const { data } = useSWR("/api/manage_account/login", fetcher);
    const user = data?.user?.name || null;
    const roleUser = data?.user?.role || 0;
    const password = data?.user?.password || null;

    useEffect(() => {
        const token = Cookies.get("token");

        if (!token) {
            router.push("/component/account_user/login_user");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const now = Date.now() / 1000;

            if (decoded.exp && decoded.exp < now) {
                Cookies.remove("token");
                router.push("/component/account_user/login_user");
            }
        } catch {
            Cookies.remove("token");
            router.push("/component/account_user/login_user");
        }
    }, []);

    const handleSubmitSignout = async () => {
        try {
            const token = Cookies.get("token");
            if (!token) {
                router.push("/component/account_user/login_user");
                return;
            }

            const res = await fetch("/api/manage_account/logout", { method: "POST" });
            if (res.ok) {
                Cookies.remove("mastodon_token");
                Cookies.remove("token");  
                Cookies.remove("redirect_params");
                await signOut({ callbackUrl: "/component/account_user/login_user" });
                toast.success(t("logout_success"));
            } else {
                toast.error(t("logout_fail"));
            }
        } catch (error) {
            console.error(error);
            toast.error(t("error_signout"));
        }
    }

    return (
        <div className={styles.navbar}>
            {roleUser === 1 
            ? 
                <div className={styles.title_logo}>
                    <div className={styles.icon_logo}>
                        <Image src="/wand_magic_sparkles.png" alt="logo" fill />
                    </div>
                    <h1 className={styles.title_navbar}>ContentGenie</h1>
                </div>
            :
                <Link href="/component/post_manage/content_generator" className={styles.title_logo}>
                    <div className={styles.icon_logo}>
                        <Image src="/wand_magic_sparkles.png" alt="logo" fill />
                    </div>
                    <h1 className={styles.title_navbar}>ContentGenie</h1>
                </Link>
            }

            {user && (
                <div className={styles.link_nav}>
                    <Link href="/component/post_manage/list_post_user" className={roleUser === 0 ? (pathname === "/component/post_manage/list_post_user"  || pathname === "/component/post_manage/content_generator"  || pathname.startsWith("/component/post_manage/list_post_user/detail_post") ? styles.post_management_current : styles.post_management) : styles.edit_profile_hide}>
                        <LocalPostOfficeIcon/>
                        <p>{t("post_management")}</p>
                    </Link>
                    <Link href="/component/upgrade_package" className={roleUser === 0 ? (pathname === "/component/upgrade_package" ? styles.upgrade_package_current : styles.upgrade_package) : styles.upgrade_package_hide}>
                        <CreditCardIcon/>
                        <p>{t("credits")}</p>
                    </Link>
                    {password &&
                        <div className={styles.link}>
                            <Link href="/component/account_user/edit_profile" className={roleUser === 0 ? (pathname === "/component/account_user/edit_profile" || pathname === "/component/account_user/change_password" ? styles.user_management_current : styles.user_management) : styles.user_management_hide}>
                                <MiscellaneousServicesIcon/>
                                <p>{t("user_management")}</p>
                            </Link>
                        </div>
                    }   
                </div>
            )}
            {roleUser === 1 && 
                <div className={styles.link_nav_admin}>
                    <Link href="/component/admin/dashboard" className={ pathname === "/component/admin/dashboard" ? styles.dashboard_current : styles.dashboard}>
                        <div className={styles.icon_dashboard}>
                            <SearchIcon></SearchIcon>
                        </div>
                        <p className={pathname === "/component/admin/dashboard" ? styles.text_dashboard_current : styles.text_dashboard}>{t("sidebar_dashboard")}</p>
                    </Link>
                    <Link href="/component/admin/dashboard/list_user" className={ pathname === "/component/admin/dashboard/list_user" ? styles.users_current : styles.users}>
                        <div className={styles.icon_users}>
                            <PeopleAltIcon></PeopleAltIcon>
                        </div>
                        <p className={pathname === "/component/admin/dashboard/list_user" ? styles.text_users_current : styles.text_users}>{t("sidebar_users")}</p>
                    </Link>
                    <Link href="/component/admin/dashboard/list_post" className={ pathname === "/component/admin/dashboard/list_post" ? styles.posts_current : styles.posts}>
                        <div className={styles.icon_posts}>
                            <MarkAsUnreadIcon></MarkAsUnreadIcon>
                        </div>
                        <p className={pathname === "/component/admin/dashboard/list_post" ? styles.text_posts_current : styles.text_posts}>{t("sidebar_posts")}</p>
                    </Link>
                </div>
            }

            <button className={password ? styles.btn_signout : styles.btn_signout_gmail} onClick={handleSubmitSignout}>
                <div className={styles.icon_signout}>
                    <ExitToAppIcon />
                </div>
                <p className={styles.text_signout}>{t("signout")}</p>
            </button>
        </div>
    );
}

export default NavbarUser;
