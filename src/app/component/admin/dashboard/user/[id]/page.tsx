import { notFound } from "next/navigation";
import styles from "../../../../../styles/detail_user.module.css";

type PageProps = {
  params: { id: string };
};

const getUserDetail = async (id: string) => {
  try {
    const res = await fetch(`http://localhost:3000/api/manage_account/user/${id}`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store" ,//cache: "force-cache"
    });
    if (!res.ok) return null;
    console.log("Res: ",res);
    return res.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export default async function ViewUserDetail({ params }: PageProps) {
  const detailUser = await getUserDetail(params.id);
  console.log("User detail: ",detailUser);

  if (!detailUser) return notFound();

  return (
    <div className={styles.container}>
      <div className={styles.inf_user_container}>
        <h1 className={styles.title}>Thông tin người dùng {detailUser.id}!</h1>
        <div className={styles.inf_user}>
          <img className={styles.avt_user} src={detailUser.avatar}/>
          <p>Họ tên: {detailUser.name}</p>
        </div>
      </div>
    </div>
  );
}
