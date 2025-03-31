import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req) {
  try{
    const formData = await req.formData();
    const content = formData.get("content");
    const imageUrl = formData.get("url");
    const audience = formData.get("audience");

    const token_mastodon = cookies().get("mastodon_token")?.value;
    console.log("Token từ cookies: ", token_mastodon);

    console.log("Image Cloudari: ", imageUrl);

    if(!content || !audience){
      return NextResponse.json({error: "Missing the field"}, {status: 400});
    }

    const statusFormData = new URLSearchParams();
    if(imageUrl){
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
          "Authorization": `Bearer ${token_mastodon}`,
        },
        body: mediaFormData,
      });
  
      if(!mediaResponse.ok){
        const errorData = await mediaResponse.json();
        throw new Error(errorData.error || "Failed to upload media: ",errorData.error);
      }
  
      const mediaData = await mediaResponse.json();
      console.log("Image was uploaded to Mastodon: ",mediaData);

      statusFormData.append("media_ids[]",mediaData.id);
    }

    statusFormData.append("status",content);
    statusFormData.append("visibility",audience);

    const statusResponse = await fetch(`${process.env.MASTODON_INSTANCE}/api/v1/statuses`,{
      method: "POST",
      headers:{
        "Authorization": `Bearer ${token_mastodon}`,
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

