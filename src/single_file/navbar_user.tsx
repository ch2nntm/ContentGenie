"use client";
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
import MarkAsUnreadIcon from '@mui/icons-material/MarkAsUnread';
import EditNoteIcon from '@mui/icons-material/EditNote';
import PaymentIcon from '@mui/icons-material/Payment';


function NavbarUser(){
    const [inputSearch, setInputSearch] = useState("");
    const [showDropdownUser, setShowDropdownUser] = useState(false);
    const [user, setUser] = useState<string | null>(null);
    const [roleUser, setRoleUser] = useState(0);
    const [avtUser, setAvtUser] = useState<string | null>(null);
    const t = useTranslations("navbar_user");
    const router = useRouter();
    const pathname = usePathname();  
    const isDashboard = pathname === "/component/admin/dashboard";

    useEffect(() => {
        const token = Cookies.get("token");
        if (token) {
            fetch("/api/manage_account/login", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(async (res) => {
                if (!res) {
                    throw new Error(`t("error_http") ${res}`);
                }
                const contentType = res.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error(t('invalid_json'));
                }
                return res.json();
            })
            .then((data) => {
                if (data.user) {
                    setUser(data.user.name);
                    setRoleUser(data.user.role);
                    setAvtUser(data.user.avatar);
                }
            })
            .catch((error) => console.error(t('error_get_user'), error));
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
    
            if (res) {
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
        if(inputSearch===""){
            router.push("/component/admin/dashboard");
        }
        if (inputSearch.trim() !== "") {
            router.push(`/component/admin/dashboard?searchQuery=${encodeURIComponent(inputSearch)}`);
        }
    };
    
    
    return(
        <div className={styles.navbar}>
            <Link href="/" className={styles.title_logo}>
                <div className={styles.icon_logo}>
                    <Image src="/wand_magic_sparkles.png" alt="logo" fill ></Image>
                </div>
                <h1 className={styles.title_navbar}>ContentGenie</h1>
            </Link>
            <div className={isDashboard ? styles.search : styles.search_hide}>
                <input className={roleUser===0 ? styles.input_search_hide : styles.input_search} type="text" placeholder={t("input_search")} value={inputSearch} onChange={(e) => setInputSearch(e.target.value)}/>
                <button onClick={handleSearch} className={roleUser===0 ? styles.btn_search_hide : styles.btn_search}>
                    <SearchIcon/>
                </button>
            </div>
            <div className={styles.icon_navbar}>
                    <div className={styles.icon_bell}>
                        <NotificationsIcon></NotificationsIcon>
                    </div>
                    <button className={styles.button_user} onClick={() => setShowDropdownUser(!showDropdownUser)}>
                        <div className={avtUser ? styles.avt_user : styles.icon_user}>
                        {!avtUser && <Image src="/icon_circle_user.png" alt="avt" fill />}
                        </div>
                        {avtUser && <img className={styles.avt_user} src={avtUser} alt={avtUser} />}
                        <p className={styles.name_user}>{user}</p>
                    </button>
                    <div className={showDropdownUser ? styles.manage_user_show : styles.manage_user_hide}>
                        <div className={styles.link}>
                        {/* className={ roleUser===0 ? styles.edit_profile : styles.edit_profile_hide} */}
                            <Link href="/component/account_user/edit_profile" className={styles.edit_profile}> 
                                <div className={styles.icon_edit_profile}>
                                    <BorderColorIcon/>
                                </div>
                                <p>{t("account_management")}</p>
                            </Link>
                            <Link href="/component/post_manage/list_post_user" className={ roleUser===0 ? styles.post_management : styles.edit_profile_hide}>
                                <div className={styles.icon_edit_profile}>
                                    <MarkAsUnreadIcon/>
                                </div>
                                <p>{t("post_management")}</p>
                            </Link>
                            <Link href="/component/post_manage/content_generator" className={styles.post_management}>
                                <div className={styles.icon_edit_profile}>
                                    <EditNoteIcon/>
                                </div>
                                <p>{t("create_content")}</p>
                            </Link>
                            <Link href="/component/admin/dashboard" className={ roleUser===1 ? styles.dashboard : styles.dashboard_hide}>
                                <div className={styles.icon_dashboard}>
                                <SearchIcon/>
                                </div>
                                <p>{t("dashboard")}</p>
                            </Link>
                            <Link href="/component/upgrade" className={styles.dashboard}>
                                <div className={styles.icon_dashboard}>
                                    <PaymentIcon/>
                                </div>
                                <p>{t("credits")}</p>
                            </Link>
                        </div>
                        <button className={styles.btn_signout} onClick={handleSubmitSignout}>
                            <div className={styles.icon_signout}>
                                <ExitToAppIcon/>
                            </div>
                            <p className={styles.text_signout}>{t("signout")}</p>
                        </button>
                    </div>
                </div>
        </div>
    )
}

export default NavbarUser;