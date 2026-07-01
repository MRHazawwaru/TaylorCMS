import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    lastPasswordChange?: Date | string; // Tambahan baru
  }
  interface Session {
    user: User & {
      id: string;
      role: string;
      lastPasswordChange?: Date | string; // Tambahan baru
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    lastPasswordChange?: Date | string; // Tambahan baru
  }
}