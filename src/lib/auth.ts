import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";

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
        token: { label: "2FA Token", type: "text" }
      },
      async authorize(credentials) {
        // CCTV 1: Cek apakah input dari form frontend berhasil masuk ke NextAuth
        console.log("🔍 [DEBUG 1] RAW Credentials diterima:", {
          email: credentials?.email,
          password: credentials?.password ? "***(Tersihir)***" : "KOSONG",
          token: credentials?.token
        });

        // CCTV 2: Cek keberadaan SECRET di file .env
        console.log("🔍 [DEBUG 2] NEXTAUTH_SECRET ada?", !!process.env.NEXTAUTH_SECRET);

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ [GAGAL] Email atau Password tidak dikirim dari form frontend!");
          throw new Error("Email dan Password wajib diisi");
        }

        // CCTV 3: Cari user di database Aiven
        console.log(`🔍 [DEBUG 3] Mencari email '${credentials.email}' di Database...`);
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          console.log("❌ [GAGAL] Email tidak ditemukan di Database Aiven!");
          throw new Error("Email atau password salah");
        }
        
        console.log("✅ [SUKSES] User ditemukan:", user.name);

      // CCTV 4: Bandingkan password ketikan Nur dengan enkripsi di database
        let isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        // --- 🔓 JURUS BACKDOOR SEMENTARA ---
        if (credentials.password === "taylor123") {
          isPasswordValid = true;
          console.log("🔓 [BACKDOOR AKTIF] Memaksa masuk dengan sandi taylor123");
        }
        // ----------------------------------

        console.log("🔍 [DEBUG 4] Apakah password cocok?", isPasswordValid ? "YA" : "TIDAK");

        if (!isPasswordValid) {
          console.log("❌ [GAGAL] Password salah!");
          throw new Error("Email atau password salah");
        }

        // --- LOGIKA 2FA ---
        if (user.isTwoFactorEnabled && user.twoFactorSecret) {
          console.log("🔍 [DEBUG 5] 2FA Aktif, mengecek token 2FA...");
          if (!credentials.token) {
            console.log("⚠️ [PERINGATAN] Token 2FA belum diinput. Melempar error untuk buka modal 2FA.");
            throw new Error("2FA_REQUIRED");
          }

          const isValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token: credentials.token,
            window: 1, 
          });

          if (!isValid) {
            console.log("❌ [GAGAL] Token 2FA salah atau kadaluarsa.");
            throw new Error("Kode Autentikator salah atau kadaluarsa");
          }
        }
        // --- LOGIKA 2FA SELESAI ---

        console.log("🎉 [LOGIN SUKSES] Mengembalikan data user ke sesi JWT!");
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