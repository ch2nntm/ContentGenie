"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import styles from "../../../styles/preview.module.css";
import NavbarUser from "@/single_file/navbar_user";
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
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import TurnedInNotIcon from '@mui/icons-material/TurnedInNot';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import RepeatIcon from '@mui/icons-material/Repeat';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import HttpsIcon from '@mui/icons-material/Https';

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
    const status = searchParams.get("isOn") || false;
    const [content, setContent] = useState("");
    const [updateContent, setUpdateContent] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [video, setVideo] = useState("");

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    const [imgUrl, setImgUrl] = useState("");
    const [messages] = useState([
        {
            role: "system", 
            content: `Tôi đang sử dụng AI trong việc marketing, hãy giúp tôi đưa ra caption tối đa 500 kí tự về chủ đề ${topic}....! Hãy trả lời bằng ngôn ngữ mà người dùng hỏi`
        },
    ]);


    const [loading, setLoading] = useState(false); 
    const fetchData = async (input: string) => {
        try {
            messages.push({role: "user", content: input});

            setLoading(true);
            const token = Cookies.get("token");
            if (!token) return;
            const responseData = await fetch("/api/manage_account/openai", {
                method: "POST",
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({ messages: messages }),
            });

            if (!responseData.ok) {
                throw new Error("Failed to fetch OpenAI response");
            }

            const data = await responseData.json();
            console.log("OpenAI replied...", data.messages?.content);
            setContent(data.messages?.content);
            setUpdateContent(data.messages?.content);

            if(topic.includes("Mua sắm"))
                setImgUrl(data.imageUrl);
            else if(topic.includes("Âm nhạc")){
                setVideo(data.music);
            }

            const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dtxm8ymr6/image/upload";
            const uploadPreset = "demo-upload";
            const form = new FormData();
            form.append("file", imgUrl);
            form.append("upload_preset", uploadPreset);

            const response = await fetch(cloudinaryUrl, {
                method: "POST",
                body: form,
            });

            const dataImg = await response.json();
            if (dataImg.secure_url) {
                console.log("IMAGE1: ",dataImg.secure_url);
                setImgUrl(dataImg.secure_url);
                console.log("IMAGE2: ",imgUrl);
            } else {
                toast.error("Upload ảnh thất bại!");
                return;
            }
        } catch (error) {
            console.error("Error fetching AI response:", error);
        } finally {
            setLoading(false); 
        }
    };

    useEffect(() => {
        fetchData(keyword);
    }, [keyword]);

    const handleCancel = () => {
        setUpdateContent(content);
        setOpenModal(false);
    }

    const hanldeSave = async () => {
        setContent(updateContent);
        setOpenModal(false);
    };

    const hanldeUpload = async () => {
        const token = Cookies.get("token");
        if (!token) {
            toast.error("401 Authentication");
            return;
        }
        try {
            const mastodonRes = await fetch("/api/mastodon", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content, audience }),
            });
    
            const mastodonData = await mastodonRes.json();
            console.log("Mastodon response:", mastodonData.data.id);
    
            if (!mastodonRes.ok) {
                toast.error("Lỗi khi gửi bài viết đến Mastodon");
                return;
            }
    
            toast.success("Mastodon post successful!");

            const userId = auth?.user?.id || null; 
            const formattedPostTime = postTime instanceof Date ? postTime.toISOString() : postTime || null; 
            fetch("/api/post_manage/upload_post", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json, text/plain,*/*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: mastodonData.data.id,
                    keyword,
                    content,
                    imgUrl,
                    posttime: formattedPostTime,
                    user_id: userId,
                    platform,
                    status,
                    audience
                }),
            })
            .then((res) => res.json())
            .then((res) => {
                if (res.message) {
                    // router.push("/");
                    setOpenModal(false);
                    toast.success("Successful");
                } else if (res.error) {
                    console.log("Res: ", res);
                }
            });
        } catch (error) {
            console.error("Lỗi khi đăng tweet:", error);
        }
    }

    // const postToMastodon = async () => {
    //     const formData = new FormData();
    //     formData.append("url", imgUrl);
    //     formData.append("content", content);
    //     console.log("Form data: ",formData);
    //     try {
    //         fetch("/api/tweet", {
    //             method: "POST",
    //             body: formData
    //           })
    //             .then(res => res.json())
    //             .then(data => {
    //                 console.log(data);
    //                 toast.success("Successful");
    //             })                
    //             .catch(err => console.error(err));
              
    //     } catch (error) {
    //         console.error("Lỗi khi đăng tweet:", error);
    //     }
    // };
    

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
                                        <p className={styles.user_name}>@{auth?.user?.username}</p>
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
                                {imgUrl && <img className={styles.img_main_post} src={imgUrl}/>}
                                <iframe style={{ display: video ? "block" : "none" }} className={styles.img_main_post} width="560" height="315" 
                                    src={`https://www.youtube.com/embed/${video}`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    >
                                </iframe>
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
                                    onClick={() => document.getElementById("datePicker")?.click()}
                                >
                                    {format(postTime, "MMM d")}
                                </button>
                                
                                <input 
                                    id="datePicker"
                                    type="date"
                                    min={formattedDate}
                                    style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
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
                    <Button className={styles.button_close} onClick={()=>setOpenModal(false)}>
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
                            {imgUrl && <img className={styles.img_edit_main_post} src={imgUrl}/>}
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
