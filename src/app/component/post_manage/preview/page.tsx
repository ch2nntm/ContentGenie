"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import styles from "../preview/preview.module.css";
import NavbarUser from "@/app/component/navbar_user/page";
import { useAuth } from "../../authProvider";
import Modal from "react-bootstrap/Modal";
import Cookies from "js-cookie";
import CloseIcon from '@mui/icons-material/Close';
import Form from "react-bootstrap/Form";
import { Button } from "@mui/material";
import { useTranslations } from "next-intl";
import { toast, ToastContainer } from "react-toastify";
import PublicIcon from '@mui/icons-material/Public';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import TurnedInNotIcon from '@mui/icons-material/TurnedInNot';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import RepeatIcon from '@mui/icons-material/Repeat';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import HttpsIcon from '@mui/icons-material/Https';
import { useRouter } from "next/navigation";
import { format, toZonedTime } from 'date-fns-tz';

interface User {
    id: string;
    avatar?: string;
    name?: string;
    email?: string;
}

function PreviewPage() {
    const auth = useAuth() as { user: User };
    const t = useTranslations("preview");
    const searchParams = useSearchParams();
    const topic = searchParams.get("topic") || "";
    const keyword = searchParams.get("keyword") || "";
    const audience = searchParams.get("audience") || "";
    const [postTime, setPostTime] = useState(new Date(searchParams.get("date") || ""));
    const platform = searchParams.get("platform") || "";
    const user_Id = searchParams.get("user_Id") || 0;
    const set_daily = searchParams.get("set_daily");
    const [content, setContent] = useState("");
    const [updateContent, setUpdateContent] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [isVideo, setIsVideo] = useState(false);
    const [isVideoTest, setIsVideoTest] = useState(true);
    const [isSpotify, setIsSpotify] = useState(false);
    const [nameSpotify, setNameSpotify] = useState("");
    const [nameArtist, setNameArtist] = useState("");
    const [resultImage, setResultImage] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const hasFetched = useRef(false);
    const router = useRouter();

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    const [imgUrl, setImgUrl] = useState("");
    const [imgUrlTest, setImgUrlTest] = useState("");
    const [messages] = useState<{ role: string; content: string }[]>([]);

    const [loading, setLoading] = useState(false); 
   
    const uploadToCloudinary = async (file: string | Blob) => {
        if (typeof file === "string" && file.startsWith("http")) {
            console.log("Skipping upload for already uploaded URL:", file);
            return file; 
        }
    
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
            console.log("user_Id:",user_Id);
            const responseData = await fetch("/api/manage_account/openai", {
                method: "POST",
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({user_Id: user_Id, topicName: topic ,messages: messages }),
            });

            if (!responseData.ok) {
                throw new Error("Failed to fetch OpenAI response");
            }

            const data = await responseData.json();
            console.log("OpenAI replied...", data.chat?.content);
            setContent(data.chat?.content);
            setUpdateContent(data.chat?.content);

            if(topic.includes("Image")){
                const uploadedImgUrl = await uploadToCloudinary(data.imageUrl);
                if (uploadedImgUrl) {
                    setImgUrl(uploadedImgUrl);
                }
            }
            else if(topic.includes("Youtube")){
                setImgUrl(`${process.env.NEXT_PUBLIC_YOUTUBE_URL}/embed/`+data.music);
                setIsVideo(true);
            }
            else if(topic.includes("Spotify")){
                const token_spotify = Cookies.get("token_spotify");
                const response = await fetch(data.spotify, {
                    headers: {
                        Authorization: `Bearer ${token_spotify}`
                    }
                });
                const dataSpotify = await response.json();
                setImgUrl(dataSpotify?.external_urls?.spotify);
                console.log("Spotify data: ",dataSpotify);
                setIsSpotify(true);
                setNameSpotify(dataSpotify?.name);
                setIsVideo(true);
                console.log("idArtist: ", dataSpotify?.artists[0].id);
                await fetch("/api/spotify", {
                    method: "POST",
                    body: JSON.stringify({ id: dataSpotify?.artists[0].id })
                }).then(async (response) => {
                    const data = await response.json();
                    setNameArtist(data.data.name);
                    setResultImage(data.data.images[0].url);
                    console.log("Result: ",resultImage);
                });
            }
        } catch (error) {
            console.error("Error fetching AI response:", error);
        } finally {
            setLoading(false); 
        }
    };

    useEffect(() => {
        console.log("Post time: ", postTime);
        if (!hasFetched.current) {  
            fetchData(keyword);
            hasFetched.current = true;
        }
    },[]);

    const handleCancel = () => {
        setUpdateContent(content);
        setOpenModal(false);
        setImgUrlTest("");
        setIsVideoTest(true);
    }

    const hanldeSave = async () => {
        setContent(updateContent);
        setOpenModal(false);
        if(imgUrlTest==="" && imgUrl!==""){
            setImgUrlTest(imgUrl);
        }
        else{
            if(imgUrlTest !== "/upload_avt.png")
                setImgUrl(imgUrlTest);
            else if(imgUrlTest)
                setImgUrl("");
        }
        setIsVideo(false);
    };

    const handleImageClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setImgUrlTest(await uploadToCloudinary(file));
            console.log("Image Test: ", imgUrlTest);
        }
    };

    const handleClickBtnCloseImg = () => {
        console.log("Click close img");
        setImgUrlTest("/upload_avt.png");
        setIsVideoTest(false);
    }

    const hanldeUpload = async () => {
        try {
            const token = Cookies.get("token");

            const id_post = Math.floor(1000 + Math.random() * 9000).toString();

            const userId = auth?.user?.id || null; 
            
            const formattedPostTime = postTime
            ? format(toZonedTime(new Date(postTime), 'Asia/Ho_Chi_Minh'), 'yyyy-MM-dd HH:mm:ss')
            : null;
            
            if(content.length > 500){
                toast.error(`${t('noti_character')}`);
                return;
            }

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
                    audience,
                    set_daily,
                    nameSpotify,
                    nameArtist,
                    resultImage
                }),
            })
            .then((res) => res.json())
            .then((res) => {
                if (res.status === "success") {
                    setOpenModal(false);
                    toast.success("Successful");
                    router.push("/component/post_manage/list_post_user");
                } else if (res.status === "error") {
                    if(res.message === "Contain blacklist") {
                        toast.error(`${t('noti_blacklist')} ${res.data.join(", ")}`);
                    }
                    else{
                        toast.error(`${t('noti_character')}`);
                    }
                }
            });
        } catch (error) {
            console.error(error);
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
                                        <p className={styles.user_name}>@ {auth?.user?.email}</p>
                                    </div>
                                </div>
                                <div className={styles.time_user}>
                                    <PublicIcon style={{display: audience==="public" ? "block" : "none"}}></PublicIcon>
                                    <HttpsIcon style={{display: audience==="private" ? "block" : "none"}}></HttpsIcon>
                                    <p className={styles.time}>2 {t("time")}</p>
                                </div>
                            </div>
                            <div className={styles.inf_post}>
                                <p className={styles.content_post}>
                                    {content}
                                </p>
                                {!isSpotify && !isVideo && imgUrl && <img className={styles.img_main_post} src={imgUrl}/>}
                                {!isSpotify && isVideo && imgUrl && <iframe style={{ display: imgUrl ? "block" : "none" }} className={styles.img_main_post} width="560" height="315" 
                                    src={imgUrl}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    >
                                </iframe>
                                }
                                {isSpotify && 
                                    <a className={styles.is_spotify} href={imgUrl}>
                                        <div className={styles.img_spotify}>
                                            <Image className={styles.img_spotify} src={resultImage} alt="Spotify artist image" width={150} height={150}/>
                                        </div>
                                        <div className={styles.sing_spotify}>
                                            <p>Spotify</p>
                                            <p className={styles.name_spotify}>{nameSpotify}</p>
                                            <p className={styles.name_artist}>{nameArtist}</p>
                                        </div>
                                    </a>
                                }
                            </div>
                            <div className={styles.interact_post}>
                                <div className={styles.back}>
                                    <KeyboardReturnIcon></KeyboardReturnIcon>
                                    <p className={styles.text_like_post}>256</p>
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
                                <div className={styles.dots}>
                                    <MoreHorizIcon></MoreHorizIcon>
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
                    <Button className={styles.button_close} onClick={() => { setOpenModal(false); setIsVideoTest(true); }}>
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
                        {!isSpotify && <Form.Group className={styles.form_group}>
                            <Form.Label className={styles.label_img}>{t("img")}</Form.Label>
                            <div onClick={handleImageClick}>
                                {!imgUrl && !isVideo && <img className={imgUrlTest ? styles.img_edit_main_post : styles.img_edit_main_post_upload} src={imgUrlTest ? imgUrlTest : "/upload_avt.png"} alt="avt"/>}
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
                        }
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
