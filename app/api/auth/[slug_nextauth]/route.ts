import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";

import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" as const },
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url }) {
        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: identifier,
          subject: "Seu login no PCHubBR",
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.5">
              <h2>PCHubBR</h2>
              <p>Clique para entrar:</p>
              <p><a href="${url}">Entrar no PCHubBR</a></p>
              <p style="color:#666;font-size:12px">Se você não solicitou isso, ignore este email.</p>
            </div>
          `,
        });
      },
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login?checkEmail=1",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };