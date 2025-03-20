"use client"; 
import { useTranslations } from "next-intl";
import styles from "../../../styles/dashboard.module.css";

import { toast } from "react-toastify";

const DeleteButton = ({ id }: { id: number }) => {
    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            const response = await fetch(`http://localhost:3000/api/manage_account/user/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                toast.success(t("delete_success") + id);
            } else {
                toast.error(t("delete_fail"));
            }
        }else {
            toast.error(t("cancel_delete"));
        }
    };

    const t = useTranslations("dashboard");

    return (
        <button type="button" onClick={handleDelete} className={styles.btn_delete_user}>
            {t("section_delete")}
        </button>
    );
};

export default DeleteButton;
