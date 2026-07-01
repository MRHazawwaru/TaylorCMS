import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(request: Request) {
  try {
    // 1. Validasi Keamanan Lapis Pertama: Cek Sesi
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "Password lama dan baru wajib diisi" }, { status: 400 });
    }

    // 2. Ambil data user dari database berdasarkan email di sesi saat ini
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    // 3. Validasi Keamanan Lapis Kedua: Cocokkan password lama
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Password lama salah!" }, { status: 400 });
    }

    // 4. Enkripsi (Hash) password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 5. Update password dan reset waktu lastPasswordChange ke hari ini
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        password: hashedNewPassword,
        lastPasswordChange: new Date(), // Ini yang akan mereset hitungan 3 bulan
      },
    });

    return NextResponse.json({ message: "Password berhasil diubah" }, { status: 200 });
  } catch (error) {
    console.error("Error merubah password:", error);
    return NextResponse.json({ error: "Gagal memproses permintaan" }, { status: 500 });
  }
}