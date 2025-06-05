import { notFound } from "next/navigation";
import styles from "../[id]/detail_user.module.css";
import Link from "next/link";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { getTranslations } from "next-intl/server";

type PageProps = Promise<{
  id: string
}>;

type UserDetail = {
  avatar: string | null;
  name: string;
  email: string;
  credits: number;
  count_post: number;
  package_buy: string;
  price: number;
  purchase_date: Date;
};


const getUserDetail = async (id: string) => {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXTAUTH_URL;
    const res = await fetch(`${BASE_URL}/api/admin/user/${id}`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store" ,
    });
    if (!res.ok) 
      window.location.href = "/component/account_user/login_user";

    const dataResponse = await res.json();
    const data = dataResponse;
    return data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export default async function ViewUserDetail(props: { params: PageProps}) {
  const detailUser = await getUserDetail((await props.params).id);
  console.log("User detail: ",detailUser);

  const t = getTranslations("detail_user");
  const monthPackage = (await t)("package_month");
  const yearPackage = (await t)("package_year");
  const creditPackage = (await t)("package_credit");

  if (!detailUser) return notFound();

  return (
    <div className={styles.container}>
      {/* <NavbarComponent/> */}
      <Link href="/component/admin/dashboard/list_user"><ArrowBackIosNewIcon className={styles.arrowback}/></Link>
      <div className={styles.inf_user_container}>
        <h1 className={styles.title}>{(await t)("user_detail")}</h1>
        <div className={styles.inf_user}>
          <img className={styles.avt_user} src={detailUser.data[0].avatar ? detailUser.data[0].avatar : "/icon_circle_user.png"}/>
          <div className={styles.inf_detail}>
            <p className={styles.text_inf}>{(await t)("name")} <p className={styles.bold_text}>{detailUser.data[0].name}</p></p>
            <p className={styles.text_inf}>{(await t)("email")} <p className={styles.bold_text}>{detailUser.data[0].email}</p></p>
            <p className={styles.text_inf}>{(await t)("quantity_credits")} <p className={styles.bold_text}>{detailUser.data[0].credits}</p></p>
            <p className={styles.text_inf}>{(await t)("quantity_post")} <p className={styles.bold_text}>{detailUser.data[0].count_post}</p></p>
            <div className={styles.packages}>
              <p>{(await t)("package_purchase")}</p>
              { detailUser.data[0].package_buy &&
                <div className={styles.table}>
                  <div className={styles.thead}>
                  <p className={styles.item_td_head}>STT</p>
                    <p className={styles.item_td_head}>{(await t)("package_name")}</p>
                    <p className={styles.item_td_head}>{(await t)("package_price")}</p>
                    <p className={styles.item_td_head}>{(await t)("date_purchase")}</p>
                  </div>
                  <div className={styles.tbody_wrapper}>
                    {detailUser.data.map((item: UserDetail, index: number) => (
                      item.package_buy && (
                        <div className={styles.tbody} key={index}>
                          <p className={styles.item_td}>{index+1}</p>
                          <p className={styles.item_td}>{item.package_buy==="Goi Thang" ? monthPackage : item.package_buy==="Goi The" ? creditPackage : yearPackage}</p>
                          <p className={styles.item_td}>{item.price.toLocaleString('vi-VN')} VND</p>
                          <p className={styles.item_td}>{new Date(item.purchase_date).getDate()}/{new Date(item.purchase_date).getMonth() + 1}/{new Date(item.purchase_date).getFullYear()}</p>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              }
              {
                !detailUser.data[0].package_buy && <p className={styles.no_package}>{(await t)("no_package")}</p>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
