import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy"; // Tambahkan library speakeasy

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        token: { label: "2FA Token", type: "text" } // Kita tambahkan slot untuk kode 2FA
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan Password wajib diisi");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          throw new Error("Email atau password salah");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Email atau password salah");
        }

        // --- LOGIKA 2FA DIMULAI DI SINI ---
        if (user.isTwoFactorEnabled && user.twoFactorSecret) {
          // Jika sistem mendeteksi 2FA aktif tapi user belum memasukkan kodenya
          if (!credentials.token) {
            // Lempar error khusus agar frontend tahu harus menampilkan form 2FA
            throw new Error("2FA_REQUIRED");
          }

          // Jika user sudah memasukkan kode, verifikasi kodenya
          const isValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token: credentials.token,
            window: 1, // Toleransi keterlambatan 30 detik
          });

          if (!isValid) {
            throw new Error("Kode Autentikator salah atau kadaluarsa");
          }
        }
        // --- LOGIKA 2FA SELESAI ---

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          lastPasswordChange: user.lastPasswordChange,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.lastPasswordChange = user.lastPasswordChange;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.lastPasswordChange = token.lastPasswordChange as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/admin/login",
  }
};