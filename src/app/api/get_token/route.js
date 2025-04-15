import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies();
    const token_mastodon = cookieStore.get("mastodon_token")?.value;
    const token_linkedin = cookieStore.get("linkedin_access_token")?.value;

    console.log("mastodon_token111: ",token_mastodon, " - linkedin_token111: ",token_linkedin);
    return Response.json({ token_mastodon, token_linkedin });
}
