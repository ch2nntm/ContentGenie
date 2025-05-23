import { notFound } from "next/navigation";
import styles from "../[id]/detail_post.module.css";
import Image from "next/image";
import PublicIcon from '@mui/icons-material/Public';
import HttpsIcon from '@mui/icons-material/Https';
import { getTranslations } from "next-intl/server";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import Link from "next/link";
import TurnedInNotIcon from '@mui/icons-material/TurnedInNot';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import RepeatIcon from '@mui/icons-material/Repeat';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

type PageProps = Promise<{ 
  id: string 
}>;

const getPostDetail = async (post_id: string) => {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXTAUTH_URL;
    const res = await fetch(`${BASE_URL}/api/admin/list_post/${post_id}`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    console.log("DETAIL: ",data);
    return data.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export default async function ViewUserDetail(props : { params: PageProps }) {
  console.log("Id: ",(await props.params).id);
  const detailPost = await getPostDetail((await props.params).id);
  console.log("Post detail:", detailPost);

  const t = getTranslations("detail_post");

  const convertDay = async (day: Date) => {
    const postDate = new Date(day);
    const currentDate = new Date();
    const timeDiff = Math.abs(currentDate.getTime() - postDate.getTime());
    const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60));

    if(postDate.getTime() > currentDate.getTime())
        return `${postDate.getDate()}-${postDate.getMonth()}-${postDate.getFullYear()}`;
    if(daysAgo<24)
        return `${daysAgo} ${(await t)("hours")}`;
    else if(daysAgo<720){
        return `${Math.floor(daysAgo/24)} ${(await t)("days")}`;
    }
    else{
        if(daysAgo>720 && daysAgo<8760){
            const monthsAgo = Math.floor(daysAgo/720);
            return `${monthsAgo} ${(await t)("months")}`;
        }
        else{
            const monthsAgo = Math.floor(daysAgo/8760);
            return `${monthsAgo} ${(await t)("years")}`;
        }
    } 
  };
  
  if (!detailPost) return notFound();

  return (
    <div className={styles.container}>
      <Link href="/component/admin/dashboard/list_post"><ArrowBackIosNewIcon className={styles.arrowback}/></Link>
      <div className={styles.inf_post_container}>
        <div className={styles.title}>
          { detailPost.platform === "Mastodon" && 
            <>
              <img className={styles.icon_platform} src="/icon_mastodon.png"/> 
              <h1 className={styles.title_text}>{(await t)("social_mastodon")}</h1>
            </>
          }
          { detailPost.platform === "LinkedIn" && 
            <>
              <img className={styles.icon_platform} src="/icon_linkedin.webp"/> 
              <h1 className={styles.title_text}>{(await t)("social_linkedin")}</h1>
            </>
          }
        </div>
        <div className={styles.navbar_post}>
          <div className={styles.inf_user}>
            <img className={styles.avt_user} src={detailPost.avatar ? detailPost.avatar : "/icon_circle_user.png"}/>
            <div className={styles.inf_detail_user}>
              <p className={styles.name_user}>{detailPost.name}</p>
              <p className={styles.email_user}>@ {detailPost.email}</p>
            </div>
          </div>
          <div className={styles.navbar_detail_post}>
            <div className={styles.audience_post}>
              {detailPost.audience === "public" && <PublicIcon/>}
              {detailPost.audience !== "public" && <HttpsIcon/>}
              <p className={styles.time_post}>{convertDay(detailPost.posttime)}</p>
            </div>
            {detailPost.status === 0 && <p className={styles.status_post}>{(await t)("status_pending")}</p>}
            {detailPost.status === 1 && <p className={styles.status_post}>{(await t)("status_posted")}</p>}
          </div>
        </div>
        <div className={styles.inf_post}>
          <p>{detailPost.content}</p>
          {detailPost.image && !detailPost.image.startsWith(process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "") && !detailPost.image.startsWith(process.env.NEXT_PUBLIC_SPOTIFY_URL ?? "") && <img src={detailPost.image} className={styles.img}/>}
          {detailPost.image && detailPost.image.startsWith(process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "") && <iframe className={styles.img} src={detailPost.image} ></iframe>}
          {detailPost.image && detailPost.image.startsWith(process.env.NEXT_PUBLIC_SPOTIFY_URL ?? "") && 
          <>
            <a className={styles.is_spotify} href={detailPost.image.split(",")[0]}>
                <div className={styles.img_spotify}>
                  <Image className={styles.img_spotify} src={detailPost.image.split(",")[3]} alt="Spotify artist image" width={150} height={150}/>
                </div>
                <div className={styles.sing_spotify}>
                    <p>Spotify</p>
                    <p className={styles.name_spotify}>{detailPost.image.split(",")[1]}</p>
                    <p className={styles.name_artist}>{detailPost.image.split(",")[2]}</p>
                </div>
            </a>
          </>
          }
                                                           
        </div>
        <div className={styles.interact_post}>
          <div className={styles.back}>
              <KeyboardReturnIcon></KeyboardReturnIcon>
              <p className={styles.text_like_post}>0</p>
          </div>
          <div className={styles.repeat}>
              <RepeatIcon></RepeatIcon>
          </div>
          <div className={styles.star}>
              <StarBorderIcon></StarBorderIcon>
          </div>
          <div className={styles.favorite}>
              <TurnedInNotIcon></TurnedInNotIcon>
          </div>
        </div>
      </div>
    </div>
  );
}
