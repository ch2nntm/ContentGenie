"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import styles from "../preview_linkedin/preview_linkedin.module.css";
import NavbarUser from "@/components/navbar_user";
import { useAuth } from "../../authProvider";
import Modal from "react-bootstrap/Modal";
import Cookies from "js-cookie";
import CloseIcon from '@mui/icons-material/Close';
import Form from "react-bootstrap/Form";
import { Button } from "@mui/material";
import { useTranslations } from "next-intl";
import { toast, ToastContainer } from "react-toastify";
import { format } from "date-fns";
import PublicIcon from '@mui/icons-material/Public';
import HttpsIcon from '@mui/icons-material/Https';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

function PreviewPage() {
    interface User {
        id: string;
        avatar?: string;
        name?: string;
        username?: string;
    }

    const auth = useAuth() as { user: User };
    const t = useTranslations("preview");
    const searchParams = useSearchParams();
    const topic = searchParams.get("topic") || "";
    const keyword = searchParams.get("keyword") || "";
    const audience = searchParams.get("audience") || "";
    const [postTime, setPostTime] = useState(new Date(searchParams.get("date") || ""));
    const platform = searchParams.get("platform") || "";
    const user_Id = searchParams.get("user_Id") || 0;
    const [content, setContent] = useState("");
    const [updateContent, setUpdateContent] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [isVideo, setIsVideo] = useState(false);
    const [isVideoTest, setIsVideoTest] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const hasFetched = useRef(false);

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    const [imgUrl, setImgUrl] = useState("");
    const [imgUrlTest, setImgUrlTest] = useState("");
    const [messages] = useState([
        {
            role: "system", 
            content: `Tôi đang sử dụng AI trong việc marketing, hãy giúp tôi đưa ra caption tối đa 500 kí tự về chủ đề ${topic}....! Hãy trả lời bằng ngôn ngữ mà người dùng hỏi`
        },
    ]);

    const [loading, setLoading] = useState(false); 

    const uploadToCloudinary = async (file: string | Blob) => {
        if (typeof file === "string" && file.startsWith("http")) {
            console.log("Skipping upload for already uploaded URL:", file);
            return file; // Trả luôn URL cũ
        }
    
        const cloudinaryUrl = process.env.CLOUDINARY_URL;
        const uploadPreset = "demo-upload";
        const form = new FormData();
        form.append("upload_preset", uploadPreset);
    
        if (typeof file === "string" && file.startsWith("blob:")) {
            const responseConvert = await fetch(file);
            const blob = await responseConvert.blob();
            const fileName = blob.type.startsWith("video/") ? "video.mp4" : "image.jpg";
            const fileConvert = new File([blob], fileName, { type: blob.type });
            form.append("file", fileConvert);
        } else {
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
    
    const fetchData = async (input: string) => {
        try {
            messages.push({role: "user", content: input});

            setLoading(true);
            const token = Cookies.get("token");
            if(!token){
                window.location.href = "/component/account_user/login_user";
            }
            const responseData = await fetch("/api/manage_account/openai", {
                method: "POST",
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({ user_Id: user_Id, messages: messages }),
            });

            if (!responseData.ok) {
                throw new Error("Failed to fetch OpenAI response");
            }

            const data = await responseData.json();
            console.log("OpenAI replied...", data.chat?.content);
            setContent(data.chat?.content);
            setUpdateContent(data.chat?.content);

            if(topic.includes("Mua sắm")){
                const uploadedImgUrl = await uploadToCloudinary(data.imageUrl);
                if (uploadedImgUrl) {
                    setImgUrl(uploadedImgUrl);
                }
            }
            else if(topic.includes("Âm nhạc")){
                setImgUrl(`https://www.youtube.com/embed/`+data.music);
                setIsVideo(true);
            }
        } catch (error) {
            console.error("Error fetching AI response:", error);
        } finally {
            setLoading(false); 
        }
    };

    useEffect(() => {
        if (!hasFetched.current) {
            fetchData(keyword);
            hasFetched.current = true;
        }
    }, [keyword]);

    const handleCancel = () => {
        setUpdateContent(content);
        setOpenModal(false);
        setImgUrlTest("");
        setIsVideoTest(true);
    }

    const handleCloseForm = () => {
        setUpdateContent(content);
        setOpenModal(false);
        setImgUrlTest("");
        setIsVideoTest(true);
    }

    const handleClickBtnCloseImg = () => {
        if(imgUrlTest !== "/upload_avt.png")
            setImgUrlTest("/upload_avt.png");
        setIsVideoTest(false);
    }


    const hanldeSave = async () => {
        setContent(updateContent);
        setOpenModal(false);
        if(!imgUrl.startsWith("https://www.youtube.com")){
            if(imgUrlTest !== "/upload_avt.png"){
                const uploadedImgUrl = await uploadToCloudinary(imgUrlTest);
                setImgUrl(uploadedImgUrl);
            }
            else{
                setImgUrl("");
            }
            setIsVideo(false);
        }
        else{
            setImgUrl(imgUrlTest);
            setIsVideo(true);
        }
    };

    const handleImageClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageUrlTest = URL.createObjectURL(file);
            const uploadedImgUrl = await uploadToCloudinary(imageUrlTest);
            setImgUrlTest(uploadedImgUrl);
        }
    };

    const hanldeUpload = async () => {
        try {
            const linkedin_id_token = Cookies.get("linkedin_id_token");
            const responseGetInfo = await fetch("/api/linkedin",{
                method: "GET",
                headers: {
                    Authorization: `Bearer ${linkedin_id_token}`,
                }
            });
            const dataresponseGetInfo = await responseGetInfo.json();
            console.log("dataresponseGetInfo: ",dataresponseGetInfo);

            const token = Cookies.get("token");
            const id_post = Math.floor(1000 + Math.random() * 9000).toString();
            const userId = auth?.user?.id || null; 
            const formattedPostTime = postTime instanceof Date 
            ? postTime.toLocaleString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }) 
            : postTime 
                ? new Date(postTime).toLocaleString("en-CA", { timeZone: "Asia/Ho_Chi_Minh", hour12: false}) 
                : null;
            fetch("/api/post_manage/upload_post", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json, text/plain,*/*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: id_post,
                    keyword,
                    content,
                    imgUrl,
                    posttime: formattedPostTime,
                    user_id: userId,
                    platform,
                    status: 0,
                    audience
                }),
            })
            .then((res) => res.json())
            .then((res) => {
                if (res.message) {
                    setOpenModal(false);
                    toast.success("Successful");
                    // router.push("/component/post_manage/list_post_user");
                } else if (res.error) {
                    console.log("Res: ", res);
                }
            });
        } catch (error) {
            console.error("Lỗi khi đăng tweet:", error);
        }
    }

    const handleDateChange = (event: { target: { value: string | number | Date; }; }) => {
        setPostTime(new Date(event.target.value));
    };
    
    return (
        <div className={styles.container}>
            <NavbarUser />
            <form className={styles.form}>
            {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        Loading...
                    </div>
                ) : (
                    <>
                        <div className={styles.post}>
                            <div className={styles.navbar_user}>
                                <div className={styles.inf_user}>
                                    {auth?.user?.avatar ? (
                                        <img className={styles.inf_user_avt} src={auth.user.avatar} alt="Avatar" />
                                    ) : (
                                        <div className={styles.inf_user_avt}>
                                            <Image src="/icon_circle_user.png" alt="Avatar" fill />
                                        </div>
                                    )}
                                    <div className={styles.inf_user_more}>
                                        <p className={styles.name_user}>{auth?.user?.name}</p>
                                        <div className={styles.time_user}>
                                            <p className={styles.time}>2 {t("time")}</p>
                                            <PublicIcon style={{display: audience==="public" ? "block" : "none"}}></PublicIcon>
                                            <HttpsIcon style={{display: audience==="private" ? "block" : "none"}}></HttpsIcon>
                                        </div>
                                    </div>
                                </div>
                               
                            </div>
                            <div className={styles.inf_post}>
                                <p className={styles.content_post}>
                                    {content}
                                </p>
                                {!isVideo && imgUrl && <img className={styles.img_main_post} src={imgUrl}/>}
                                {isVideo && imgUrl && <iframe style={{ display: imgUrl ? "block" : "none" }} className={styles.img_main_post} width="560" height="315" 
                                    src={imgUrl}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    >
                                </iframe>
                                }
                            </div>
                            <div className={styles.interact_post}>
                                <div className={styles.back}>
                                    <ThumbUpOffAltIcon></ThumbUpOffAltIcon>
                                    <p>{t("like")}</p>
                                </div>
                                <div className={styles.repeat}>
                                    <ChatBubbleOutlineIcon></ChatBubbleOutlineIcon>
                                    <p>{t("comment")}</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.scheduled_post}>
                            <p className={styles.title_scheduled_post}>{t("scheduled_post")}</p>
                            <div className={styles.time_scheduled_post}>
                                <button 
                                    type="button" 
                                    className={styles.item} 
                                    onClick={() => (document.getElementById("datePicker") as HTMLInputElement)?.showPicker()}
                                >
                                    {format(postTime, "MMM d")}
                                </button>
                                <input 
                                    id="datePicker"
                                    type="date"
                                    min={formattedDate}
                                    style={{ opacity: 0, position: "absolute" }}
                                    value={postTime.toISOString().split("T")[0]} 
                                    onChange={handleDateChange}
                                />

                            </div>
                        </div>
                        <div className={styles.btn_container}>
                            <button type="button" onClick={() => setOpenModal(true)} className={styles.btn_edit}>
                                {t("btn_edit")}
                            </button>
                            <button type="button" className={styles.btn_upload} onClick={hanldeUpload}>
                                {t("upload_post")}
                            </button>
                        </div>
                    </>
                )}
            </form>
            <Modal className={styles.modal_container} show={openModal}>
                <Modal.Header className={styles.modal_header}>
                    <Button className={styles.button_close} onClick={handleCloseForm}>
                        <CloseIcon className={styles.icon_close}></CloseIcon>
                    </Button>
                    <Modal.Title className={styles.modal_title}>{t("btn_edit")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className={styles.form_container}>
                        <Form.Group>
                            <Form.Label className={styles.label_title}>{t("content")}</Form.Label>
                            <Form.Control className={styles.control_title}  as="textarea" placeholder="..." value={updateContent} onChange={(e) => setUpdateContent(e.target.value)} rows={5}/>
                        </Form.Group>
                        <Form.Group className={styles.form_group}>
                            <Form.Label className={styles.label_img}>{t("img")}</Form.Label>
                            <div onClick={handleImageClick}>
                                {!imgUrl && !isVideo && <img src={imgUrlTest ? imgUrlTest : "/upload_avt.png"} className={imgUrlTest ? styles.img_edit_main_post : styles.img_edit_main_post_upload} alt="avt"/>}
                                {imgUrl && !isVideo && <img src={imgUrlTest ? imgUrlTest : imgUrl} className={imgUrlTest ? styles.img_edit_main_post : styles.img_edit_main_post_upload} />}
                                {isVideo && imgUrl && <iframe style={{ display: isVideoTest ? "block" : "none" }} className={styles.img_edit_main_post} width="560" height="315" 
                                    src={imgUrl}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    >
                                </iframe>
                                }
                                {!isVideoTest && <img className={styles.img_edit_main_post} src={imgUrlTest ? imgUrlTest : "/upload_avt.png"} alt="avt"/>}
                                
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
                            <Button className={styles.button_close_img} onClick={handleClickBtnCloseImg}>
                                <CloseIcon className={styles.icon_close_img}></CloseIcon>
                            </Button>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className={styles.modal_footer}>
                    <Button className={styles.btn_close} onClick={handleCancel}>
                        <span className={styles.text_close}>{t("btn_close")}</span>
                    </Button>
                    <Button className={styles.btn_save} onClick={hanldeSave}>
                        <span className={styles.text_save}>{t("btn_save")}</span>
                    </Button>
                </Modal.Footer>
            </Modal>
            <ToastContainer/>
        </div>
    );
}

export default PreviewPage;
