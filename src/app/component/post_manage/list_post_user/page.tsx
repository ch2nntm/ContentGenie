"use client"
import { useState, useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
import styles from "../../../styles/list_post_user.module.css";
import { useTranslations } from 'next-intl';
import Cookies from 'js-cookie';
import dynamic from "next/dynamic";
import { useAuth } from "../../authProvider";
import Image from "next/image";
import PublicIcon from '@mui/icons-material/Public';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import TurnedInNotIcon from '@mui/icons-material/TurnedInNot';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import RepeatIcon from '@mui/icons-material/Repeat';
import HttpsIcon from '@mui/icons-material/Https';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Modal from "react-bootstrap/Modal";
import { Button } from "@mui/material";
import Form from "react-bootstrap/esm/Form";
import CloseIcon from '@mui/icons-material/Close';
import { toast, ToastContainer } from "react-toastify";

const NavbarComponent = dynamic(() => import("@/single_file/navbar_user"));

interface Post {
    id: number;
    content: string;
    image: string;
    posttime: Date;
    platform: string;
    audience: string;
    status: number;
}

interface User{
    avatar: string;
    name: string;
    username: string;
}

function ListPostUser() {
    const t = useTranslations("list_post_user");
    const auth = useAuth() as { user: User };

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [isClickBtnEdit, setIsClickBtnEdit] = useState(false); 
    const [activeDots, setActiveDots] = useState<number | null>(null); 
    const [activeEdit, setActiveEdit] = useState<number | null>(null); 
    const [likes, setLikes] = useState<Record<number, number>>({});
    const [updateContent, setUpdateContent] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [image, setImage] = useState("");
    const [isClickMastodon, setIsClickMastodon] = useState(true);

    const slidesRef = useRef<{ [key: number]: HTMLElement | null }>({});
    const handleGeneratePdf = (postId: number) => {
        const opt = {
            margin: 1,
            filename: `post_${postId}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
        };

        if (slidesRef.current[postId]) {
            html2pdf().from(slidesRef.current[postId]).set(opt).save();
        }
    };

    const handleDots = (id: number) => {
        setActiveDots(activeDots === id ? null : id);
    };

    const handleEdit = (id: number, content: string) => {
        setActiveDots(null);
        setActiveEdit(id);
        setIsClickBtnEdit(true);
        setUpdateContent(content); 
    };

    const handleImageClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setImage(imageUrl);
        }
    };

    const handleClickBtnCloseImg = () => {
        console.log("Click close img");
        setImage("/upload_avt.png");
    }

    useEffect(() => {
        const token = Cookies.get("token");
        if(!token){
            window.location.href = "/component/account_user/login_user";
        }
        if(isClickMastodon===true)
            handlePostMastodon();
    }, [image]);

    const handlePostMastodon = async() => {
        setIsClickMastodon(true);
        try {
            const token = Cookies.get("token");
            if (!token) {
                setPosts([]);
                setLoading(false);
                return;
            }

            const token_mastodon = Cookies.get("mastodon_token");

            if(!token_mastodon){
                toast.error(t("miss_token_mastondon"));
                window.location.href = "/api/mastodon/auth";  
                return;
            }

            const response = await fetch("/api/post_manage/list_post_user", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`t("error_http") ${response.status}`);
            }

            const data = await response.json();
            const sortedPosts = data.posts_mastodon.sort((a: { posttime: string | number | Date; }, b: { posttime: string | number | Date; }
                                ) => new Date(b.posttime).getTime() - new Date(a.posttime).getTime());
            setPosts(sortedPosts);

            if (data.posts_mastodon.length > 0) {
                for (const post of data.posts_mastodon) {
                    try {
                        const detailResponse = await fetch(`/api/mastodon/${post.id}`, {
                            method: "GET"
                        });

                        if (!detailResponse.ok) {
                            throw new Error(`${detailResponse.status}`);
                        }

                        const detailData = await detailResponse.json();

                        setLikes(prevLikes => ({
                            ...prevLikes,
                            [post.id]: detailData.data.favourites_count ?? 0 
                        }));
                    } catch (error) {
                        console.error(t("error_fetch"), error);
                    }
                }
            }
        } catch (error) {
            console.error(t("error_fetch"), error);
        } finally {
            setLoading(false);
        }
    }

    const handlePostLinkedin = async() => {
        setIsClickMastodon(false);
        try {
            const token = Cookies.get("token");
            if (!token) {
                setPosts([]);
                setLoading(false);
                return;
            }

            const token_mastodon = Cookies.get("linkedin_access_token");

            if(!token_mastodon){
                toast.error(t("miss_token_linkedin"));
                window.location.href = "/api/linkedin/auth";  
                return;
            }

            const response = await fetch("/api/post_manage/list_post_user", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`t("error_http") ${response.status}`);
            }

            const data = await response.json();
            const sortedPosts = data.posts_linkedin.sort((a: { posttime: string | number | Date; }, b: { posttime: string | number | Date; }
                                ) => new Date(b.posttime).getTime() - new Date(a.posttime).getTime());
            setPosts(sortedPosts);
        } catch (error) {
            console.error(t("error_fetch"), error);
        } finally {
            setLoading(false);
        }
    }
    
    const handleCancel = () => {
        setIsClickBtnEdit(false);
        setImage("");
    }

    const handleDelete = async (id: number) => {
        if (window.confirm(t("confirm_delete"))) {
            try {
                if(isClickMastodon === true){
                    const response = await fetch(`/api/mastodon/${id}`, {
                        method: "DELETE"
                    });
    
                    if (response.status === 401) {
                        toast.error(t("miss_token_mastondon"));
                        window.location.href = "/api/mastodon/auth";  
                        return;
                    }
                    toast.success(t("post_delete"));
                    window.location.reload();
                }
                else{
                    const response = await fetch(`/api/post_linkedin/${id}`, {
                        method: "DELETE"
                    });
    
                    if (response.status === 401) {
                        toast.error(t("miss_token_linkedin"));
                        window.location.href = "/api/linkedin/auth";  
                        return;
                    }
                    toast.success(t("post_delete"));
                    // window.location.reload();
                }
            }catch (error) {
                console.error(t("error_delete"), error);
            }
        } else {
            toast.error(t("cancel_delete"));
        }
    }

    const hanldeSave = async (id: number, img: string) => {
        const token_mastodon = Cookies.get("mastodon_token");

        if(!token_mastodon){
            toast.error(t("miss_token_mastondon"));
            window.location.href = "/api/mastodon/auth";  
            return;
        }

        let uploadedImageUrl;
        if(!image){
            uploadedImageUrl = img;
        }
        else if(image === "/upload_avt.png"){
            uploadedImageUrl = null;
        }
        else{
            uploadedImageUrl = image;
            if (fileInputRef.current?.files?.length) {
                const file = fileInputRef.current.files[0];
                const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dtxm8ymr6/image/upload";
                const uploadPreset = "demo-upload";
                const form = new FormData();
                form.append("file", file);
                form.append("upload_preset", uploadPreset);
    
                const response = await fetch(cloudinaryUrl, {
                    method: "POST",
                    body: form,
                });
    
                const data = await response.json();
                if (data.secure_url) {
                    uploadedImageUrl = data.secure_url;
                } else {
                    return;
                }
            }
        }

        const token = Cookies.get("token");
        if (!token) return;
        fetch("/api/post_manage/edit_post", {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: id,
                content: updateContent,
                image: uploadedImageUrl,
            }),
            })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error(`t("error_http") ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                if (data.accessToken) {
                    Cookies.set("token", data.accessToken, { expires: 1 });
                }
            })
            .catch((error) => console.error(error));

        const formData = new FormData();
        formData.append("image", uploadedImageUrl);
        formData.append("content", updateContent);
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
                setActiveEdit(0);
                window.location.reload();
            }
        }catch (error) {
            console.error(error);
        }
    };

    const convertDay = (day: Date) => {
        const postDate = new Date(day);
        const currentDate = new Date();
        const timeDiff = Math.abs(currentDate.getTime() - postDate.getTime());
        const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60));


        if(postDate.getTime() > currentDate.getTime())
            return `${postDate.getDate()}-${postDate.getMonth()+1}-${postDate.getFullYear()}`;
        if(daysAgo===0){
            return `${Math.floor(timeDiff / (1000 * 60))} ${t("minutes")}`;
        }
        if(daysAgo<24)
            return `${daysAgo} ${t("hours")}`;
        else if(daysAgo<720){
            return `${Math.floor(daysAgo/24)} ${t("days")}`;
        }
        else{
            if(daysAgo>720 && daysAgo<8760){
                const monthsAgo = Math.floor(daysAgo/720);
                return `${monthsAgo} ${t("months")}`;
            }
            else{
                const monthsAgo = Math.floor(daysAgo/8760);
                return `${monthsAgo} ${t("years")}`;
            }
        } 
    };

    
    

    return (
        <>
            <NavbarComponent />
            <div className={styles.list_container}>
                <div className="title_page">
                    <h1>{t("title_page")}</h1>
                </div>
                <div className={styles.btn_platform}>
                    <button className={styles.btn_mastodon} type="button" onClick={handlePostMastodon}>
                        Mastodon
                        <div className={styles.icon_mastodon}>
                            <Image  src="/icon_mastodon.png" fill alt={""}/>
                        </div>
                    </button>
                    <button className={styles.btn_linkedin} type="button" onClick={handlePostLinkedin}>
                        Linkedin
                        <div className={styles.icon_linkedin}>
                            <Image  src="/icon_linkedin.webp" fill alt={""}/>
                        </div>
                    </button>
                </div>
                <div className="list_post">
                    {loading ? (
                        <p></p>
                    ) : posts.length > 0 ? (
                        posts.map((item) => (
                            <div key={item.id}   className={styles.item_post}>
                                {item.platform === "Mastodon" &&<div className={styles.mastodon_platform}>
                                    <div ref={(el) => { slidesRef.current[item.id] = el; }}>
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
                                                    <p className={styles.user_name}>@{item.platform}</p>
                                                </div>
                                            </div>
                                            <div className={styles.time_post}>
                                                <div className={styles.time_user}>
                                                    {item.audience==="public" && <PublicIcon />}
                                                    {item.audience==="private" && <HttpsIcon/> }
                                                    <p className={styles.time}>{convertDay(item.posttime)}</p>
                                                </div>
                                                <div className={styles.status_post}>
                                                    <p>{item.status===1 ? t("posted") : t("pending")}</p>
                                                </div>
                                            </div>
                                            
                                        </div>
                                        <div className={styles.content_post}>
                                            <p className={styles.item_content}>{item.content}</p>
                                            {item.image && !item.image.startsWith("https://www.youtube.com") && <img src={item.image} className={styles.img_post}/>}
                                            {item.image && item.image.startsWith("https://www.youtube.com") && <iframe src={item.image} className={styles.video_post} ></iframe>}
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
                                                {item.status === 1 && <p className={styles.text_like_post}>{likes[item.id]}</p>}
                                            </div>
                                            <div className={styles.favorite}>
                                                <TurnedInNotIcon></TurnedInNotIcon>
                                            </div>
                                            <div onClick={() => handleDots(item.id)} className={styles.dots}>
                                                <MoreHorizIcon></MoreHorizIcon>
                                            </div>
                                        </div>
                                    </div>
                                    {activeDots === item.id && (
                                        <div className={styles.dots_menu}>
                                            <button className={styles.dots_edit} type="button" onClick={() => handleEdit(item.id, item.content)}>{t("edit")}</button>
                                            <button className={styles.dots_delete} type="button" onClick={() => handleDelete(item.id)}>{t("delete")}</button>
                                            <button className={styles.dots_export} type="button" onClick={() => handleGeneratePdf(item.id)}>{t("export_pdf")}</button>
                                        </div>
                                    )}
                                    {activeEdit === item.id && <Modal className={styles.modal_container} show={isClickBtnEdit}>
                                        <Modal.Header className={styles.modal_header}>
                                            <Button className={styles.button_close} onClick={()=>setIsClickBtnEdit(false)}>
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
                                                    <Form.Label htmlFor="avt" className={styles.label_title}>{t("image")} <span className={styles.icon_start}>*</span></Form.Label>
                                                    <div onClick={handleImageClick}>
                                                        {!image && <img className={styles.upload_avt_modal} src={item.image ? item.image : "/upload_avt.png"} alt="avt"/>}
                                                        {image && <img src={image} className={styles.upload_avt_modal} />}
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
                                            <Button className={styles.btn_save} onClick={() => hanldeSave(item.id, item.image)}>
                                                <span className={styles.text_save}>{t("btn_save")}</span>
                                            </Button>
                                        </Modal.Footer>
                                    </Modal>}
                                    </div>
                                }
                                {item.platform === "LinkedIn" &&<div className={styles.mastodon_platform}>
                                    <div ref={(el) => { slidesRef.current[item.id] = el; }}>
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
                                                    <p className={styles.user_name}>@{item.platform}</p>
                                                </div>
                                            </div>
                                            <div className={styles.time_post}>
                                                <div className={styles.time_user}>
                                                    {item.audience==="public" && <PublicIcon />}
                                                    {item.audience==="private" && <HttpsIcon/> }
                                                    <p className={styles.time}>{convertDay(item.posttime)}</p>
                                                </div>
                                                <div className={styles.status_post}>
                                                    <p>{item.status===1 ? t("posted") : t("pending")}</p>
                                                </div>
                                            </div>
                                            
                                        </div>
                                        <div className={styles.content_post}>
                                            <p className={styles.item_content}>{item.content}</p>
                                            {item.image && <img src={item.image} className={styles.img_post}/>}
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
                                                {item.status === 1 && <p className={styles.text_like_post}>{likes[item.id]}</p>}
                                            </div>
                                            <div className={styles.favorite}>
                                                <TurnedInNotIcon></TurnedInNotIcon>
                                            </div>
                                            <div onClick={() => handleDots(item.id)} className={styles.dots}>
                                                <MoreHorizIcon></MoreHorizIcon>
                                            </div>
                                        </div>
                                    </div>
                                    {activeDots === item.id && (
                                        <div className={styles.dots_menu}>
                                            {/* <button className={styles.dots_edit} type="button" onClick={() => handleEdit(item.id, item.content)}>{t("edit")}</button> */}
                                            <button className={styles.dots_delete} type="button" onClick={() => handleDelete(item.id)}>{t("delete")}</button>
                                            <button className={styles.dots_export} type="button" onClick={() => handleGeneratePdf(item.id)}>{t("export_pdf")}</button>
                                        </div>
                                    )}
                                    {activeEdit === item.id && <Modal className={styles.modal_container} show={isClickBtnEdit}>
                                        <Modal.Header className={styles.modal_header}>
                                            <Button className={styles.button_close} onClick={()=>setIsClickBtnEdit(false)}>
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
                                                    <Form.Label htmlFor="avt" className={styles.label_title}>{t("image")} <span className={styles.icon_start}>*</span></Form.Label>
                                                    <div onClick={handleImageClick}>
                                                        {!image && <img className={styles.upload_avt_modal} src={item.image ? item.image : "/upload_avt.png"} alt="avt"/>}
                                                        {image && <img src={image} className={styles.upload_avt_modal} />}
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
                                            <Button className={styles.btn_save} onClick={() => hanldeSave(item.id, item.image)}>
                                                <span className={styles.text_save}>{t("btn_save")}</span>
                                            </Button>
                                        </Modal.Footer>
                                    </Modal>}
                                    </div>
                                }
                            </div>
                            
                        ))
                    ) : (
                        <p>{t("no_post")}</p>
                    )}
                </div>
                <ToastContainer/>
            </div>
        </>
    );
}

export default ListPostUser;
