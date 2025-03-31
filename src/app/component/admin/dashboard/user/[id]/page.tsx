import { notFound } from "next/navigation";
import styles from "../../../../../styles/detail_user.module.css";
import dynamic from "next/dynamic";
import Link from "next/link";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { getTranslations } from "next-intl/server";

type PageProps = Promise<{
  id: string
}>;

const getUserDetail = async (id: string) => {
  try {
    const res = await fetch(`http://localhost:3000/api/manage_account/user/${id}`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store" ,
    });
    if (!res.ok) return null;


    const response = await fetch(`http://localhost:3000/api/post_manage/list_post_user/${id}`, {
      method: "GET",
    });

    const data = await response.json();
    console.log("Data: ",data.quantity);

    const dataResponse = await res.json();
    dataResponse.quantity_post = data.quantity ?? 0;

    return dataResponse;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export default async function ViewUserDetail(props: { params: PageProps}) {
  const detailUser = await getUserDetail((await props.params).id);
  console.log("User detail: ",detailUser);

  const NavbarComponent = dynamic(() => import("@/single_file/navbar_user"));
  const t = getTranslations("detail_user");

  if (!detailUser) return notFound();

  return (
    <div className={styles.container}>
      <NavbarComponent/>
      <Link href="http://localhost:3000/component/admin/dashboard"><ArrowBackIosNewIcon className={styles.arrowback}/></Link>
      <div className={styles.inf_user_container}>
        <h1 className={styles.title}>{(await t)("user_detail")}</h1>
        <div className={styles.inf_user}>
          <img className={styles.avt_user} src={detailUser.avatar ? detailUser.avatar : "/icon_circle_user.png"}/>
          <div className={styles.inf_detail}>
            <p className={styles.text_inf}>{(await t)("name")} <p className={styles.bold_text}>{detailUser.name}</p></p>
            <p className={styles.text_inf}>{(await t)("email")} <p className={styles.bold_text}>{detailUser.email}</p></p>
            <p className={styles.text_inf}>{(await t)("quantity_credits")} <p className={styles.bold_text}>{detailUser.credits}</p></p>
            <p className={styles.text_inf}>{(await t)("quantity_post")} <p className={styles.bold_text}>{detailUser.quantity_post}</p></p>
          </div>
        </div>
      </div>
    </div>
  );
}
