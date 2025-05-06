"use client"
import NavbarUser from "@/app/component/navbar_user/page";
import styles from "../list_user/list_user_dashboard.module.css"
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import SearchIcon from '@mui/icons-material/Search';
import Image from "next/image";

interface account{
    avatar: string;
    count_post: number;
    credits: number;
    email: string;
    id: number;
    name: string;
    password: string;
    role: number;
}

function ListUserDashboard() {
    const t = useTranslations("list_user_dashboard");
    const [users, setUsers] = useState<account[]>([]);
    const [loading, setLoading] = useState(false); 

    useEffect(()=>{
        const fetchData = async () => {
            const token = Cookies.get("token");
            if(!token){
                window.location.href = "/component/account_user/login_user";
            }
            setLoading(true);
            try{
                const response = await fetch("/api/admin/user",{
                    method: "GET",
                    headers:{
                        "Authorization": `Bearer: ${token}`
                    }
                });
                const dataResponse = await response.json();
                const data = dataResponse.users;
                setUsers(data);
                console.log("data: ",data);
            }
            catch(error){
                console.log(error);
            }
            finally {
                setLoading(false); 
            }
        }
        fetchData();
    },[])
    
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

    const totalPages = Math.ceil(users.length / usersPerPage);

    const [valueSearch, setValueSearch] = useState("");

    const handleSearch = async() => {
        const token = Cookies.get("token");
        if(!token){
            window.location.href = "/component/account_user/login_user";
        }
        const res = await fetch(`/api/admin/user?searchQuery=${encodeURIComponent(valueSearch)}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        const dataResponse = await res.json();
        const data = dataResponse.users;
        setUsers(data);
        console.log("data: ",data);
    }

    return(
        <div className={styles.container}>
            <NavbarUser/>
            <div className={styles.content}>
                <div className={styles.section}>
                    <div className={styles.search}>
                        <input type="text" placeholder={t("input_search")} onChange={(e) => setValueSearch(e.target.value)} value={valueSearch} className={styles.input_search} />
                        <button className={styles.btn_search} onClick={handleSearch}><SearchIcon/></button>
                    </div>
                    <div className={styles.item_user_management}>
                    {loading ? (
                        <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        Loading...
                        </div>
                    ) : currentUsers.length > 0 ? (
                        <>
                        <div className={styles.title_list}>
                            <p className={styles.avt_user_container_title}>{t("image")}</p>
                            <p className={styles.item_name_user_title}>{t("name")}</p>
                            <p className={styles.item_email_user}>{t("email")}</p>
                            <p className={styles.item_credit_user_title}>{t("quantity_credits")}</p>
                            <p className={styles.item_post_of_user_title}>{t("quantity_post")}</p>
                        </div>
                        {currentUsers.map((item: account) => (
                            <div key={item.id} className={styles.item_user}>
                                <Link href={`/component/admin/dashboard/user/${item.id}`} className={styles.inf_user}>
                                    <div className={styles.avt_user_container}>
                                        <Image
                                            alt="avatar"
                                            width={50}
                                            height={50}
                                            className={styles.avt_user}
                                            src={item.avatar ? item.avatar : "/icon_circle_user.png"}
                                        />
                                    </div>
                                    <p className={styles.item_name_user}>{item.name}</p>
                                    <p className={styles.item_email_user}>@{item.email}</p>
                                    <p className={styles.item_credit_user}>
                                        <span className={styles.span}>{item.credits}</span>
                                    </p>
                                    <p className={styles.item_post_of_user}>
                                        <span className={styles.span}>{item.count_post}</span>
                                    </p>
                                </Link>
                            </div>
                        ))}
                        <div className={styles.pagination}>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={currentPage === 1 ? styles.btn_previous_page : styles.btn_previous_page_active}
                            >
                                {t("previous_page")}
                            </button>

                            <span>
                                {t("page")} {currentPage} / {totalPages}
                            </span>

                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={currentPage === totalPages ? styles.btn_next_page : styles.btn_next_page_active}
                            >
                                {t("next_page")}
                            </button>
                        </div>
                        </>
                    ) : (
                        <p></p>
                    )}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default ListUserDashboard