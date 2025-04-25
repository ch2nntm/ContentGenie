"use client";
import useSWR from "swr";
import { useEffect, useState } from "react";
import styles from "../app/styles/navbar_user.module.css";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { signOut } from "next-auth/react";
import NotificationsIcon from '@mui/icons-material/Notifications';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SearchIcon from '@mui/icons-material/Search';
import PasswordIcon from '@mui/icons-material/Password';

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
    const [inputSearch, setInputSearch] = useState("");
    const [showDropdownUser, setShowDropdownUser] = useState(false);
    const t = useTranslations("navbar_user");
    const router = useRouter();
    const pathname = usePathname();  
    const isDashboard = pathname === "/component/admin/dashboard";

    const { data, error } = useSWR("/api/manage_account/login", fetcher);
    const user = data?.user?.name || null;
    const roleUser = data?.user?.role || 0;
    const avtUser = data?.user?.avatar || null;
    const password = data?.user?.password || null;

    useEffect(() => {
        if (error) {
            Cookies.remove("token");
            window.location.href = "/component/account_user/login_user";
            console.error(t('error_get_user'), error);
        }
    }, [error]);

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
                await signOut({ redirect: false });
                router.push("/component/account_user/login_user");
                toast.success(t("logout_success"));
            } else {
                toast.error(t("logout_fail"));
            }
        } catch (error) {
            console.error(error);
            toast.error(t("error_signout"));
        }
    }

    const handleSearch = () => {
        if (inputSearch.trim() === "") {
            router.push("/component/admin/dashboard");
        } else {
            router.push(`/component/admin/dashboard?searchQuery=${encodeURIComponent(inputSearch)}`);
        }
    };

    return (
        <div className={styles.navbar}>
            <Link href="/component/post_manage/content_generator" className={styles.title_logo}>
                <div className={styles.icon_logo}>
                    <Image src="/wand_magic_sparkles.png" alt="logo" fill />
                </div>
                <h1 className={styles.title_navbar}>ContentGenie</h1>
            </Link>

            {user && (
                <div className={styles.link_nav}>
                    <Link href="/component/post_manage/content_generator" className={pathname === "/component/post_manage/content_generator" ? styles.content_generator_current : styles.content_generator}>
                        <p>{t("create_content")}</p>
                    </Link>
                    <Link href="/component/upgrade_package" className={pathname === "/component/upgrade_package" ? styles.upgrade_package_current : styles.upgrade_package}>
                        <p>{t("credits")}</p>
                    </Link>
                    <Link href="/component/post_manage/list_post_user" className={roleUser === 0 ? (pathname === "/component/post_manage/list_post_user" ? styles.post_management_current : styles.post_management) : styles.edit_profile_hide}>
                        <p>{t("post_management")}</p>
                    </Link>
                    <Link href="/component/admin/dashboard" className={roleUser === 1 ? (pathname === "/component/admin/dashboard" ? styles.dashboard_current : styles.dashboard) : styles.dashboard_hide}>
                        <p>{t("dashboard")}</p>
                    </Link>
                </div>
            )}

            <div className={isDashboard ? styles.search : styles.search_hide}>
                <input className={roleUser === 0 ? styles.input_search_hide : styles.input_search} type="text" placeholder={t("input_search")} value={inputSearch} onChange={(e) => setInputSearch(e.target.value)} />
                <button onClick={handleSearch} className={roleUser === 0 ? styles.btn_search_hide : styles.btn_search}>
                    <SearchIcon />
                </button>
            </div>

            <div className={styles.icon_navbar}>
                <div className={styles.icon_bell}>
                    <NotificationsIcon />
                </div>
                <button className={styles.button_user} onClick={() => setShowDropdownUser(!showDropdownUser)}>
                    <div className={avtUser ? styles.avt_user : styles.icon_user}>
                        {!avtUser && <Image src="/icon_circle_user.png" alt="avt" fill />}
                    </div>
                    {avtUser && <img className={styles.avt_user} src={avtUser} alt={avtUser} />}
                    <p className={styles.name_user}>{user}</p>
                </button>
                {user && (
                    <div className={showDropdownUser ? styles.manage_user_show : styles.manage_user_hide}>
                            {password &&
                                <div className={styles.link}>
                                    <Link href="/component/account_user/edit_profile" className={styles.edit_profile}>
                                        <div className={styles.icon_edit_profile}>
                                            <BorderColorIcon />
                                        </div>
                                        <p>{t("edit_profile")}</p>
                                    </Link>
                                    <Link href="/component/account_user/change_password" className={styles.change_password}>
                                        <div className={styles.icon_edit_profile}>
                                            <PasswordIcon />
                                        </div>
                                        <p>{t("change_password")}</p>
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
                )}
            </div>
        </div>
    );
}

export default NavbarUser;
