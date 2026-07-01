import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Inisialisasi NextAuth dengan konfigurasi dari lib/auth.ts
const handler = NextAuth(authOptions);

// Export sebagai method GET dan POST sesuai standar Next.js App Router
export { handler as GET, handler as POST };