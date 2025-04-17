// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";

// export async function POST(req) {
//   try {
//     const formData = await req.formData();
//     const content = formData.get("content");
//     const imageUrl = formData.get("url");
//     const audience = formData.get("audience");

//     const token_mastodon = cookies().get("mastodon_token")?.value;
//     console.log("Token từ cookies: ", token_mastodon);
//     console.log("Image URL: ", imageUrl);

//     if (!content || !audience) {
//       return NextResponse.json({ error: "Missing the field" }, { status: 400 });
//     }

//     const statusFormData = new URLSearchParams();
//     let fullContent = content;

//     const isYouTube = imageUrl?.includes("youtube.com") || imageUrl?.includes("youtu.be");

//     if (imageUrl && !isYouTube) {
//       const imageResponse = await fetch(imageUrl);

//       if (!imageResponse.ok) {
//         throw new Error("Không tải được file từ URL Cloudinary");
//       }

//       const imageBuffer = await imageResponse.arrayBuffer();
//       const contentType = imageResponse.headers.get("content-type") || "image/png";
//       const imageBlob = new Blob([imageBuffer], { type: contentType });

//       const mediaFormData = new FormData();
//       mediaFormData.append("file", imageBlob, "media-file");

//       const mediaResponse = await fetch(`${process.env.MASTODON_INSTANCE}/api/v1/media`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token_mastodon}`,
//         },
//         body: mediaFormData,
//       });

//       if (!mediaResponse.ok) {
//         const errorData = await mediaResponse.json();
//         throw new Error(errorData.error || "Failed to upload media");
//       }

//       const mediaData = await mediaResponse.json();
//       console.log("Media uploaded to Mastodon: ", mediaData);

//       statusFormData.append("media_ids[]", mediaData.id);
//     } else if (isYouTube) {
//       fullContent += `\n\n📺 Video: ${imageUrl}`;
//     }

//     statusFormData.append("status", fullContent);
//     statusFormData.append("visibility", audience);

//     const statusResponse = await fetch(`${process.env.MASTODON_INSTANCE}/api/v1/statuses`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token_mastodon}`,
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//       body: statusFormData,
//     });

//     if (!statusResponse.ok) {
//       const errorData = await statusResponse.json();
//       throw new Error(errorData.error || "Failed to post status");
//     }

//     const postData = await statusResponse.json();
//     console.log("Status posted to Mastodon: ", postData);

//     return NextResponse.json({ success: true, postData }, { status: 200 });

//   } catch (error) {
//     console.error("Error: ", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
