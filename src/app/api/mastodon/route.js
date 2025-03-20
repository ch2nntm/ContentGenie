import { NextResponse } from "next/server";

// export async function POST(req) {
//   try {
//     const { content, audience } = await req.json();
//     console.log("Content: ",content);
//     console.log("Audience: ",audience);

//     if (!content) {
//       return NextResponse.json({ error: "Missing status content" }, { status: 400 });
//     }

//     const status = content;
//     const response = await fetch(`${process.env.MASTODON_INSTANCE}/api/v1/statuses`, {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${process.env.MASTODON_ACCESS_TOKEN}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ status, visibility: audience }),
//     });


//     if (!response.ok) {
//       const errorData = await response.json();
//       console.log("Error: ",response.error);
//       throw new Error(errorData.error || "Failed to post status");
//     }

//     const data = await response.json();
//     return NextResponse.json({ success: true, data }, { status: 200 });

//   } catch (error) {
//     console.error("Lỗi đăng bài lên Mastodon:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

export async function POST(req) {
  try{
    const formData = await req.formData();
    const content = formData.get("content");
    const imageUrl = formData.get("url");

    if(!imageUrl || !content){
      return NextResponse.json({error: "Missing the field"}, {status: 400});
    }

    const imageResponse = await fetch(imageUrl);
    if(!imageResponse.ok){
      throw new Error("Don't upload image from Cloudary");
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBlob = new Blob([imageBuffer], {type: 'image/png'});

    const mediaFormData = new FormData();
    mediaFormData.append("file", imageBlob, "image.png");

    const mediaResponse = await fetch(`${process.env.MASTODON_INSTANCE}/api/v1/media`,{
      method: "POST",
      headers:{
        "Authorization": `Bearer ${process.env.MASTODON_ACCESS_TOKEN}`,
      },
      body: mediaFormData,
    });

    if(!mediaResponse.ok){
      const errorData = await mediaResponse.json();
      throw new Error(errorData.error || "Failed to upload media");
    }

    const mediaData = await mediaResponse.json();
    console.log("Image was uploaded to Mastodon: ",mediaData);

    const statusFormData = new URLSearchParams();
    statusFormData.append("status",content);
    statusFormData.append("media_ids[]",mediaData.id);

    const statusResponse = await fetch(`${process.env.MASTODON_INSTANCE}/api/v1/statuses`,{
      method: "POST",
      headers:{
        "Authorization": `Bearer ${process.env.MASTODON_ACCESS_TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: statusFormData,
    });

    if(!statusResponse.ok){
      const errorData = await statusResponse.json();
      throw new Error(errorData.error || "Failed to post status");
    }

    const postData = await statusResponse.json();
    console.log("Post: ",postData);

    return NextResponse.json({success: true, postData}, {status: 200});
  }catch(error){
    console.error("Error: ",error);
    return NextResponse.json({error: error.message}, {status: 500});
  }
}