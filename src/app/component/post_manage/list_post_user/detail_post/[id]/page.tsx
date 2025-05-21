"use client"; 

import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import html2pdf from "html2pdf.js";
import { notFound, useRouter } from "next/navigation";
import styles from "../[id]/detail_post.module.css";
import Image from "next/image";
import PublicIcon from '@mui/icons-material/Public';
import HttpsIcon from '@mui/icons-material/Https';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import Link from "next/link";
import TurnedInNotIcon from '@mui/icons-material/TurnedInNot';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import RepeatIcon from '@mui/icons-material/Repeat';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import NavbarComponent from "@/app/component/navbar_user/page";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import { Button } from "@mui/material";
import Form from "react-bootstrap/esm/Form";
import CloseIcon from '@mui/icons-material/Close';

type PageProps = Promise<{ 
  id: string 
}>;

interface post{
  post_id: string;
  title: string;
  content: string;
  image: string;
  posttime: Date;
  audience: string;
  avatar: string;
  name: string;
  email: string;
  platform: string;
  status: number
}
export default function ViewUserDetail(props : { params: PageProps }) {
  const [detailPost, setDetailPost] = useState<post | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("detail_post");
  const [isClick, setIsClick] = useState(false);
  const router = useRouter();

  const slidesRef = useRef<HTMLDivElement | null>(null);
  const [updateContent, setUpdateContent] = useState("");
  const [isClickBtnEdit, setIsClickBtnEdit] = useState(false); 
  const [activeEdit, setActiveEdit] = useState(false); 

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleEdit = (id: string, content: string) => {
    setIsClick(false);
    setActiveEdit(true);
    setIsClickBtnEdit(true);
    setUpdateContent(content); 
};

  const handleGeneratePdf = (id: string) => {
    const opt = {
      margin: 1,
      filename: `detail_post_${id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    if (slidesRef.current) {
      html2pdf().from(slidesRef.current).set(opt).save();
    }
  };

  

  const getPostDetail = async (post_id: string) => {
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_AUTH_URL;
      const res = await fetch(`${BASE_URL}/api/admin/list_post/${post_id}`, {
        method: "GET",
        headers: { "Accept": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) return null;

      const data = await res.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching post:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchPostDetail = async () => {
      const postId = (await props.params).id;
      const data = await getPostDetail(postId);
      if (data) {
        setDetailPost(data);
        setLoading(false);
      } else {
        notFound();
      }
    };

    fetchPostDetail();
  }, [props.params]);

  const handleDelete = async (id: string, platform: string, status: number) => {
    if (window.confirm(t("confirm_delete"))) {
        try {
            if(platform === "Mastodon"){
              const token_mastodon = Cookies.get("mastodon_token");
              if(!token_mastodon){
                toast.error(t("miss_token_mastondon"));
                window.location.href = "/api/mastodon/auth";
              }
              const res_mastodon = await fetch(`/api/mastodon/${id}`, {
                  method: "DELETE",
                  body: JSON.stringify({ status }),
              });
              const result = await res_mastodon.json();
              if (result.status === "success") {  
                toast.success(t("post_delete"));
                router.push("/component/post_manage/list_post_user");
              }
            }
            else{
              const linkedin_token = Cookies.get("linkedin_token");
              if(!linkedin_token){
                toast.error(t("miss_token_linkedin"));
                window.location.href = "/api/linkedin/auth";
              }

              const res_linkedin = await fetch(`/api/post_linkedin/${id}`, {
                  method: "DELETE",
                  body: JSON.stringify({ status }),
              });
              const result = await res_linkedin.json();
              if (result.status === "success") {  
                toast.success(t("post_delete"));
                router.push("/component/post_manage/list_post_user");
              }
            }
        }catch (error) {
            console.error(t("error_delete"), error);
        }finally{
            setLoading(false);
        }
    } else {
        toast.error(t("cancel_delete"));
    }
}

  const [image, setImage] = useState("");
  const handleSave = async (id: string, img: string, status: number) => {
    const token_mastodon = Cookies.get("mastodon_token");

    if(!token_mastodon && status === 1){
        toast.error(t("miss_token_mastondon"));
        window.location.href = "/api/mastodon/auth";  
        return;
    }

    let uploadedImageUrl;
    if(!image){
        uploadedImageUrl = img;
    }
    else if(image === "/upload_avt.png"){
        uploadedImageUrl = '';
    }
    else{
        const imgUrlTest = await uploadToCloudinary(image);
        uploadedImageUrl = imgUrlTest;
    }

    const formData = new FormData();
    formData.append("image", uploadedImageUrl);
    formData.append("content", updateContent);
    formData.append("status", status.toString());
    try {
        const response = await fetch(`/api/mastodon/${id}`, {
            method: "PUT",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`t("error_http") ${response.status}`);
        }
        else{
            toast.success("Update successful");
            setActiveEdit(false);
            window.location.reload();
        }
    }catch (error) {
        console.error(error);
    }
  };

  const uploadToCloudinary = async (file: string | Blob) => {
    const cloudinaryUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL;
    const uploadPreset = "demo-upload";
    const form = new FormData();
    form.append("upload_preset", uploadPreset);

    if (typeof file === "string" && file.startsWith("blob:")) {
        const responseConvert = await fetch(file);
        const blob = await responseConvert.blob();
        const fileName = blob.type.startsWith("video/") ? "video.mp4" : "image.jpg";
        const fileConvert = new File([blob], fileName, { type: blob.type });
        form.append("file", fileConvert);
    } else if(typeof file === "string" && file.startsWith("http")){
        form.append("file", file);
    }

    try {
        if (!cloudinaryUrl) {
            throw new Error("cloudinaryUrl is not defined");
        }

        const response = await fetch(cloudinaryUrl, {
            method: "POST",
            body: form,
        });

        const dataImg = await response.json();
        if (dataImg.secure_url) {
            return dataImg.secure_url; 
        } else {
            toast.error("Upload ảnh thất bại!");
            return null;
        }
    } catch (error) {
        console.error("Lỗi khi upload ảnh:", error);
        return null;
    }
};

  if (loading) return <div>Loading...</div>;

  const convertDay = (day: Date) => {
    const postDate = new Date(day);
    const currentDate = new Date();
    const timeDiff = Math.abs(currentDate.getTime() - postDate.getTime());
    const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (postDate.getTime() > currentDate.getTime()) {
      return `${postDate.getDate()}-${postDate.getMonth() + 1}-${postDate.getFullYear()}`;
    }

    if (daysAgo === 0) {
      return `${Math.floor(timeDiff / (1000 * 60))} ${t("minutes")}`;
    }
    if (daysAgo < 1) {
      return `${Math.floor(timeDiff / (1000 * 60 * 60))} ${t("hours")}`;
    }
    if (daysAgo < 30) {
      return `${daysAgo} ${t("days")}`;
    } else if (daysAgo < 365) {
      const monthsAgo = Math.floor(daysAgo / 30);
      return `${monthsAgo} ${t("months")}`;
    } else {
      const yearsAgo = Math.floor(daysAgo / 365);
      return `${yearsAgo} ${t("years")}`;
    }
  };

  const handleCancel = () => {
    setIsClickBtnEdit(false);
    setImage("");
}

  const handleDots = () => {
    setIsClick(!isClick);
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        const imageUrl = URL.createObjectURL(file);
        const imgUrlTest = await uploadToCloudinary(imageUrl);
        setImage(imgUrlTest);
    }
};

const handleClickBtnCloseImg = () => {
  setImage("/upload_avt.png");
}

  return (
    <div className={styles.container}>
      <NavbarComponent />
      <Link href="/component/post_manage/list_post_user">
        <ArrowBackIosNewIcon className={styles.arrowback} />
      </Link>
      <div className={styles.inf_post_container}>
        <div ref={slidesRef}>
          <div className={styles.title}>
            {detailPost && detailPost.platform === "Mastodon" && (
              <>
                <img className={styles.icon_platform} src="/icon_mastodon.png" />
                <h1 className={styles.title_text}>{t("social_mastodon")}</h1>
              </>
            )}
            {detailPost && detailPost.platform === "LinkedIn" && (
              <>
                <img className={styles.icon_platform} src="/icon_linkedin.webp" />
                <h1 className={styles.title_text}>{t("social_linkedin")}</h1>
              </>
            )}
          </div>
          <div className={styles.navbar_post}>
            <div className={styles.inf_user}>
              <img className={styles.avt_user} src={detailPost && detailPost.avatar || "/icon_circle_user.png"} />
              <div className={styles.inf_detail_user}>
                <p className={styles.name_user}>{detailPost && detailPost.name}</p>
                <p className={styles.email_user}>@ {detailPost && detailPost.email}</p>
              </div>
            </div>
            <div className={styles.navbar_detail_post}>
              <div className={styles.audience_post}>
                {detailPost &&  detailPost.audience === "public" && <PublicIcon />}
                {detailPost &&  detailPost.audience !== "public" && <HttpsIcon />}
                <p className={styles.time_post}>{detailPost && convertDay(detailPost.posttime)}</p>
              </div>
              {detailPost &&  detailPost.status === 0 && <p className={styles.status_post}>{t("status_pending")}</p>}
              {detailPost &&  detailPost.status === 1 && <p className={styles.status_post}>{t("status_posted")}</p>}
            </div>
          </div>
          <div className={styles.inf_post}>
            <p>{detailPost && detailPost.content}</p>
            {detailPost && detailPost.image && !detailPost.image.startsWith(process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "") && !detailPost.image.startsWith(process.env.NEXT_PUBLIC_SPOTIFY_URL ?? "") && <img src={detailPost.image} className={styles.img} />}
            {detailPost && detailPost.image && detailPost.image.startsWith(process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "") && <iframe className={styles.img} src={detailPost.image} />}
            {detailPost && detailPost.image && detailPost.image.startsWith(process.env.NEXT_PUBLIC_SPOTIFY_URL ?? "") && (
              <>
                <a className={styles.is_spotify} href={detailPost.image.split(",")[0]}>
                  <div className={styles.img_spotify}>
                    <img className={styles.img_spotify} src={detailPost.image.split(",")[3]} alt="Spotify artist image" width={150} height={150} />
                  </div>
                  <div className={styles.sing_spotify}>
                    <p>Spotify</p>
                    <p className={styles.name_spotify}>{detailPost.image.split(",")[1]}</p>
                    <p className={styles.name_artist}>{detailPost.image.split(",")[2]}</p>
                  </div>
                </a>
              </>
            )}
          </div>
        </div>
        <div className={styles.interact_post}>
          <div className={styles.back}>
            <KeyboardReturnIcon />
            <p className={styles.text_like_post}>0</p>
          </div>
          <div className={styles.repeat}>
            <RepeatIcon />
          </div>
          <div className={styles.star}>
            <StarBorderIcon />
          </div>
          <div className={styles.favorite}>
            <TurnedInNotIcon />
          </div>
          <div onClick={handleDots} className={styles.dots}>
            <MoreHorizIcon />
          </div>
          {isClick && 
            <div className={styles.dots_menu}>
              {detailPost && detailPost.platform === "Mastodon" && <button className={styles.dots_edit} type="button" onClick={() => detailPost && handleEdit(detailPost.post_id, detailPost.content)}>{t("edit")}</button>}
              <button className={styles.dots_delete} type="button" onClick={() => detailPost && handleDelete(detailPost.post_id, detailPost.platform, detailPost.status)}>{t("delete")}</button>
              <button className={styles.dots_export} type="button" onClick={() => detailPost && handleGeneratePdf(detailPost.post_id)}>{t("export_pdf")}</button>
            </div>
          }
        </div>
      {activeEdit && (
        <Modal className={styles.modal_container} show={isClickBtnEdit}>
          <div>
            <Modal.Header className={styles.modal_header}>
              <Button className={styles.button_close} onClick={() => { setIsClickBtnEdit(false); setImage(""); }}>
                <CloseIcon className={styles.icon_close}></CloseIcon>
              </Button>
              <Modal.Title className={styles.modal_title}>{t("btn_edit")}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form className={styles.form_container}>
                <Form.Group>
                  <Form.Label className={styles.label_title}>{t("content")}<span className={styles.icon_start}>*</span></Form.Label>
                  <Form.Control className={styles.control_title} as="textarea" placeholder="..." value={updateContent} onChange={(e) => setUpdateContent(e.target.value)} rows={5} />
                </Form.Group>
                <Form.Group className={styles.form_group}>
                  <Form.Label htmlFor="avt" className={styles.label_title}>{t("image")}</Form.Label>
                  <div onClick={handleImageClick}>
                    {!image && detailPost && detailPost.image && !detailPost.image.startsWith(process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "") && !detailPost.image.startsWith(process.env.NEXT_PUBLIC_SPOTIFY_URL ?? "") &&
                      <img className={styles.upload_avt_modal} src={detailPost.image ? detailPost.image : "/upload_avt.png"} width="560" height="315" alt="avt" />
                    }
                    {!image && detailPost && detailPost.image && detailPost.image.startsWith(process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "") &&
                      <iframe className={styles.img_edit_main_post} width="560" height="315"
                        src={detailPost.image}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                      </iframe>
                    }
                    {!image && detailPost && detailPost.image && detailPost.image.startsWith(process.env.NEXT_PUBLIC_SPOTIFY_URL ?? "") &&
                      <a className={styles.is_spotify_edit} href={detailPost.image.split(",")[0]}>
                        <div className={styles.img_spotify}>
                          <Image className={styles.img_spotify} src={detailPost.image.split(",")[3]} alt="Spotify artist image" width={150} height={150} />
                        </div>
                        <div className={styles.sing_spotify}>
                          <p>Spotify</p>
                          <p className={styles.name_spotify}>{detailPost && detailPost.image.split(",")[1]}</p>
                          <p className={styles.name_artist}>{detailPost && detailPost.image.split(",")[2]}</p>
                        </div>
                      </a>
                    }
                    {!image && detailPost && !detailPost.image && <img className={styles.upload_avt_modal} src="/upload_avt.png" alt="avt" />}
                    {image && <img className={styles.upload_avt_modal} src={image} alt="avt" />}
                  </div>
                  <Form.Control
                    ref={fileInputRef}
                    id="avt"
                    type="file"
                    className={styles.choose_avt}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <Button className={detailPost && detailPost.image && detailPost.image.startsWith(process.env.NEXT_PUBLIC_SPOTIFY_URL ?? "") ? styles.button_close_img_spotify : styles.button_close_img} onClick={handleClickBtnCloseImg}>
                    <CloseIcon className={styles.icon_close_img}></CloseIcon>
                  </Button>
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer className={styles.modal_footer}>
              <Button className={styles.btn_close} onClick={handleCancel}>
                <span className={styles.text_close}>{t("btn_close")}</span>
              </Button>
              <Button className={styles.btn_save} onClick={() => detailPost && handleSave(detailPost.post_id, detailPost.image, detailPost.status)}>
                <span className={styles.text_save}>{t("btn_save")}</span>
              </Button>
            </Modal.Footer>
          </div>
        </Modal>
      )}
      </div>
    </div>
  );
}
