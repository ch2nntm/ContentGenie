import NextAuth, { NextAuthOptions, Profile } from 'next-auth';
import prisma from '../../../../../lib/prisma';
import GoogleProvider from 'next-auth/providers/google';
import { JWTPayload, SignJWT } from 'jose';

declare module "next-auth" {
  interface Profile {
    picture?: string;
    id?: number;
    role?: number;
    avatar?: string
  }

  interface Session {
    accessToken?: string;
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
    session: { strategy: 'jwt' },
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ],
    callbacks: {
      async signIn({ profile }) {
        if (!profile?.email) throw new Error('No profile');

        await prisma.account.upsert({
          where: { email: profile.email },
          create: { 
            email: profile.email, 
            name: profile.name, 
            avatar: profile.picture || '',
            username: "", 
            password: "", 
            role: 0
          },
          update: { 
            name: profile.name, 
            avatar: profile.picture 
          },
        });        
        return true;
      },
      async session({ session, token }) {
        session.accessToken = typeof token.accessToken === 'string' ? token.accessToken : undefined;
        console.log("Session data: ", session);
        return session;
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
          token.id = account.id;
          profile.id = token.id as number;
          profile.role = 0;
          profile.avatar = profile.picture || '';
          const payload = profile;
         
          token.accessToken = await generateToken(payload);
        }
        console.log("Token JWT Backend: ", token);
        return token;
      },
      async redirect({ baseUrl }) {
        return baseUrl + '/component/account_user/login_user';
      },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

