import { error } from "console";
import { NextResponse } from "next/server";
  
// Trả về đường link khi đăng nhập
// export async function GET(req) {
//   const CLIENT_ID = "8660xy4jt5qye8";
//   const REDIRECT_URI = "https://dev.example.com/auth/linkedin/callback";

//   const linkedInAuthURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=openid%20profile%20email`;

//   return new Response(JSON.stringify({ url: linkedInAuthURL }), {
//     headers: { "Content-Type": "application/json" },
//     status: 200,
//   });
// }
  
  
  export async function GET(req) {
      try {
        const authHeader = req.headers.get("authorization"); 
        const token = authHeader?.split(" ")[1];
    
        if (!token) {
          return NextResponse.json({ error: "Missing ID Token" }, { status: 400 });
        }
  
        const response = await fetch("https://api.linkedin.com/v2/userinfo", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const data = await response.json();
        console.log("LinkedIn Profile Data:", data.sub);
    
        return NextResponse.json(data, { status: 200 });
      } catch (error) {
        console.error("Token Decode Error:", error);
        return NextResponse.json({ error: "Failed to decode ID Token" }, { status: 500 });
      }
    }

export async function POST(req) {
  try{
    const { userId, content, audience, image} = await req.json();
  
    if (!userId || !content || !audience) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
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
    
      const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
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
        return NextResponse.json({ success: true, postId: data });
      } else {
        return NextResponse.json({ error: "Failed to post", details: data }, { status: 400 });
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
        const response = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
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
        
          const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
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
            return NextResponse.json({ success: true, postId: dataResult });
          } else {
            return NextResponse.json({ error: "Failed to post", details: data }, { status: 400 });
          }
        }
        
        return NextResponse.json({error},{status: 400});
      } catch (error) {
        console.error('Error during the upload process:', error);
      }
    return NextResponse.json({message: "Error"}, {status: 400});
    }
    return NextResponse.json({error},{status:409});
  }catch(error){
    console.log("error: ",error);
    return NextResponse.json({error}, {status: 500});
  }
}



// export async function GET(req) {
//   try {
//     const authHeader = req.headers.get("authorization");
//     const token = authHeader?.split(" ")[1];

//     if (!token) {
//       return NextResponse.json({ error: "Missing Token" }, { status: 400 });
//     }

//     const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
//       method: "GET",
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     if (!profileRes.ok) {
//       return NextResponse.json({ error: "Failed to fetch profile" }, { status: profileRes.status });
//     }

//     const profileData = await profileRes.json();
//     const userUrn = profileData.sub ? `urn:li:person:${profileData.sub}` : null;
//     console.log("User URN:", userUrn);

//     if (!userUrn) {
//       return NextResponse.json({ error: "User URN not found" }, { status: 400 });
//     }

//     const response = await fetch(
//       `https://api.linkedin.com/v2/ugcPosts?q=author&author=${encodeURIComponent(userUrn)}`,
//       {
//         method: "GET",
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     const data = await response.json();

//     if (!response.ok) {
//       return NextResponse.json({ error: "Failed to fetch posts", details: data }, { status: response.status });
//     }

//     return NextResponse.json({ posts: data.elements }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
//   }
// }
