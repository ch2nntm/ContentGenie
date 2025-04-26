import { NextResponse } from "next/server";

const LINKEDIN_URL_API = process.env.LINKEDIN_URL_API;
  
export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization"); 
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ status: "error", message: "Missing ID Token" }, { status: 400 });
    }

    const response = await fetch(`${LINKEDIN_URL_API}/v2/userinfo`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    
    const data = await response.json();
    console.log("LinkedIn Profile Data:", data.sub);

    return NextResponse.json({ status: "success", message: "Get info account linkedin success", data: data }, { status: 200 });
  } catch (error) {
    console.error("Token Decode Error:", error);
    return NextResponse.json({ status: "error", message: error }, { status: 500 });
  }
}

export async function POST(req) {
  try{
    const { userId, content, audience, image} = await req.json();
  
    if (!userId || !content || !audience) {
      return NextResponse.json({ status: "error", message: "Missing data" }, { status: 400 });
    }
    const authHeader = req.headers.get("authorization"); 
    const token = authHeader?.split(" ")[1];
    console.log("Authorization Header:", token);

    if(image === ""){
      const postData = {
        author: `urn:li:person:${userId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: content },
            shareMediaCategory: "NONE"
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": audience }, 
      };
    
      const response = await fetch(`${LINKEDIN_URL_API}/v2/ugcPosts`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify(postData),
      });
    
      const data = await response.json();
    
      if (response.ok) {
        return NextResponse.json({ status: "success", message: "Post linkedin success", data: data });
      } else {
        return NextResponse.json({ status: "error", message: "Failed to post" }, { status: 400 });
      }
    }
    else{
      //Register the image
      const registerUploadRequest = {
        registerUploadRequest: {
          owner: "urn:li:person:8xQ6CcyQE8", 
          recipes: [
            "urn:li:digitalmediaRecipe:feedshare-image"
          ],
          serviceRelationships: [
            {
              identifier: "urn:li:userGeneratedContent",
              relationshipType: "OWNER"
            }
          ]
        }
      };

      try {
        const response = await fetch(`${LINKEDIN_URL_API}/v2/assets?action=registerUpload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,  
            'LinkedIn-Version': '202503',         
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          },
          body: JSON.stringify(registerUploadRequest) 
        });
    
        const data = await response.json();
        const uploadUrl = data.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;

        // const imageUrl = image;
        const imageResponse = await fetch(image);
        if (!imageResponse.ok) throw new Error("Failed to fetch image");
        const imageBuffer = await imageResponse.arrayBuffer();
        const assets = data.value.asset;

        // Upload Image Binary File
        const responseUploadUrl = await fetch(uploadUrl,{
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'image/jpeg',
            'media-type-family': 'STILLIMAGE'
          },
          body: imageBuffer
        });

        if(responseUploadUrl.status === 201){
          // Create the Image Share
          const postData = {
            author: `urn:li:person:${userId}`,
            lifecycleState: "PUBLISHED",
            specificContent: {
              "com.linkedin.ugc.ShareContent": {
                shareCommentary: { text: content },
                shareMediaCategory: "IMAGE",
                  media: [
                      {
                          status: "READY",
                          description: {
                              text: "Center stage!"
                          },
                          media: `${assets}`,
                          title: {
                              text: "LinkedIn Talent Connect 2025"
                          }
                      }
                  ]
              },
            },
            visibility: { "com.linkedin.ugc.MemberNetworkVisibility": audience }, 
          };
        
          const response = await fetch(`${LINKEDIN_URL_API}/v2/ugcPosts`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
              "X-Restli-Protocol-Version": "2.0.0",
            },
            body: JSON.stringify(postData),
          });

          const dataResult = await response.json();
          if (response.ok) {
            return NextResponse.json({ status: "success", message: "Post linkedin success", data: dataResult });
          } else {
            return NextResponse.json({ status: "error", message: "Failed to post" }, { status: 400 });
          }
        }
        
        return NextResponse.json({ status: "error", message: "Missing wrong" }, { status: 400 });
      } catch (error) {
        console.error('Error during the upload process:', error);
        return NextResponse.json({ status: "error", message: error}, { status: 400 });
      }
    }
  }catch(error){
    console.log("error: ",error);
    return NextResponse.json({ status: "error", message: error}, {status: 500});
  }
}

