import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Tarik status 2FA dari database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isTwoFactorEnabled: true },
    });

    return NextResponse.json({ isTwoFactorEnabled: user?.isTwoFactorEnabled || false }, { status: 200 });
  } catch (error) {
    console.error("Error Cek Status 2FA:", error);
    return NextResponse.json({ error: "Gagal mengecek status 2FA" }, { status: 500 });
  }
}