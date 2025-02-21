"use client";
import { useEffect, useState } from "react";
import styles from "../app/styles/navbar_user.module.css";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

function NavbarUser(){

    const [inputSearch, setInputSearch] = useState("");
    const [showDropdownUser, setShowDropdownUser] = useState(false);
    const [user, setUser] = useState<string | null>(null);
    const [roleUser, setRoleUser] = useState(0);
    const t = useTranslations("navbar_user");
    const router = useRouter();

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
                    throw new Error(`Lỗi HTTP: ${res}`);
                }
                const contentType = res.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Phản hồi không phải JSON hợp lệ");
                }
                return res.json();
            })
            .then((data) => {
                if (data.user) {
                    setUser(data.user.name);
                    setRoleUser(data.user.role);
                }
            })
            .catch((error) => console.error("Lỗi lấy thông tin user:", error));
        }
      }, []);

    const handleSubmitSignout = async () => {
        try {
            const token = Cookies.get("token");
    
            if (!token) {
              router.push("/component/account_user/login");
              return;
            }
    
            const res = await fetch("/api/manage_account/logout", { method: "POST" });
    
            if (res) {
                Cookies.remove("token", { path: "/" }); 
                router.push("/component/account_user/login");
                setUser(null); 
                toast.success("Đăng xuất thành công!");
            } else {
                toast.error("Đăng xuất thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
            toast.error("Có lỗi xảy ra!");
        }
    }
    
    return(
        <div className={styles.navbar}>
            <Link href="/" className={styles.title_logo}>
                <div className={styles.icon_logo}>
                    <Image src="/wand_magic_sparkles.png" alt="logo" fill ></Image>
                </div>
                <h1 className={styles.title_navbar}>ContentGenie</h1>
            </Link>
            <div className={styles.search}>
                    <input className={roleUser===0 ? styles.input_search_hide : styles.input_search} type="text" placeholder={t("input_search")} value={inputSearch} onChange={(e) => setInputSearch(e.target.value)}/>
                </div>
            <div className={styles.icon_navbar}>
                    <button className={styles.icon_bell}>
                        <Image src="/icon_bell.png" alt="Noti" fill ></Image>
                    </button>
                    <button className={styles.button_user} onClick={() => setShowDropdownUser(!showDropdownUser)}>
                        <div className={styles.icon_user}>
                            <Image src="/icon_circle_user.png" alt="User" fill ></Image>
                        </div>
                        <p className={styles.name_user}>{user}</p>
                    </button>
                    <div className={showDropdownUser ? styles.manage_user_show : styles.manage_user_hide}>
                        <Link href="/component/account_user/edit_profile" className={ roleUser===0 ? styles.edit_profile : styles.edit_profile_hide}>
                            <div className={styles.icon_edit_profile}>
                                <Image src="/icon_edit_profile.png" alt="Icon edit profile" fill></Image>
                            </div>
                            <p>{t("account_management")}</p>
                        </Link>
                        <Link href="/component/admin/dashboard" className={ roleUser===1 ? styles.dashboard : styles.dashboard_hide}>
                            <div className={styles.icon_dashboard}>
                                <Image src="/icon_sidebar_dashboard.png" alt="Icon dashboard" fill></Image>
                            </div>
                            <p>{t("dashboard")}</p>
                        </Link>
                        <button className={styles.btn_signout} onClick={handleSubmitSignout}>
                            <div className={styles.icon_signout}>
                                <Image src="/signout.png" alt="Icon signout" fill></Image>
                            </div>
                            <p className={styles.text_signout}>{t("signout")}</p>
                        </button>
                    </div>
                </div>
        </div>
    )
}

export default NavbarUser;