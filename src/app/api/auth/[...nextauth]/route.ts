import NextAuth, { NextAuthOptions, Profile } from 'next-auth';
import prisma from '../../../../../lib/prisma';
import GoogleProvider from 'next-auth/providers/google';
import { JWTPayload, SignJWT } from 'jose';
import  {cookies} from "next/headers";

declare module "next-auth" {
  interface Profile {
    picture?: string;
    id?: number;
    role?: number;
    avatar?: string;
    name?: string;
    credits?: number;
    expiration_date?: Date;
  }
}

const secretKey = new TextEncoder().encode("your-secret-key");

async function generateToken(payload: JWTPayload | Profile | undefined) {
    const jwtPayload: JWTPayload = { ...payload } as JWTPayload;
    return await new SignJWT(jwtPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h") 
        .sign(secretKey);
}

const authOptions: NextAuthOptions = {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ],
    callbacks: {
      async signIn({ profile }) {
        console.log("SignIn Profile: ", profile);
        if (!profile?.email) throw new Error('No profile');

        await prisma.account.upsert({
          where: { email: profile.email },
          create: { 
            email: profile.email, 
            name: profile.name, 
            avatar: profile.picture || '',
          },
          update: { 
            name: profile.name, 
            avatar: profile.picture 
          },
        });        
        return true;
      },
      async jwt({ token, profile }) {
        if (profile) {
          const account = await prisma.account.findUnique({
            where: {
              email: profile.email,
            },
          });
          if (!account) {
            throw new Error('No user found');
          }
          profile.id = account.id as number;
          profile.role = account.role;
          profile.avatar = profile.picture || '';
          profile.credits = account.credits;
          profile.expiration_date = account.expiration_date || undefined;
          const payload = profile;
         
          token.accessToken = await generateToken(payload);
        }
        if (token.accessToken) {
          const cookieStore = await cookies();
          console.log("Session accessToken: ", String(token.accessToken));
          cookieStore.set("token", String(token.accessToken), { path: "/", sameSite: "lax" });
        }

        console.log("Token JWT Backend: ", token);
        return token;
      }
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

