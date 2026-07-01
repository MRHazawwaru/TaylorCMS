import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

// [GET] Men-generate Kunci Rahasia dan QR Code untuk di-scan HP
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Buat rahasia unik beserta URL otomatis untuk Google Authenticator
    const secret = speakeasy.generateSecret({
      name: `Taylor CMS (${session.user.email})`, // Nama yang akan muncul di HP
    });
    
    // 2. Ubah URL tersebut menjadi gambar QR Code
    // speakeasy otomatis men-generate otpauth_url yang sangat akurat
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url as string);

    // Kita kembalikan secret.base32 (format string rahasia standar 2FA) dan gambarnya
    return NextResponse.json({ secret: secret.base32, qrCodeUrl }, { status: 200 });
  } catch (error) {
    console.error("Error Generate 2FA:", error);
    return NextResponse.json({ error: "Gagal membuat QR Code" }, { status: 500 });
  }
}

// [POST] Memverifikasi kode yang diketik admin untuk menyalakan 2FA
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token, secret } = await request.json();

    if (!token || !secret) {
      return NextResponse.json({ error: "Token dan Secret wajib diisi" }, { status: 400 });
    }

    // Cek apakah kode 6 digit dari HP cocok dengan rahasianya
    // Parameter window: 1 memberikan toleransi waktu 30 detik (mencegah error jika jam HP agak lambat)
    const isValid = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token: token,
      window: 1, 
    });

    if (!isValid) {
      return NextResponse.json({ error: "Kode Autentikator salah atau kadaluarsa" }, { status: 400 });
    }

    // Jika cocok, simpan ke database dan aktifkan
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        isTwoFactorEnabled: true,
        twoFactorSecret: secret,
      },
    });

    return NextResponse.json({ message: "Autentikasi 2 Langkah berhasil diaktifkan!" }, { status: 200 });
  } catch (error) {
    console.error("Error Verify 2FA:", error);
    return NextResponse.json({ error: "Gagal verifikasi" }, { status: 500 });
  }
}

// [DELETE] Mematikan fitur 2FA
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        isTwoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    return NextResponse.json({ message: "2FA berhasil dimatikan" }, { status: 200 });
  } catch (error) {
    console.error("Error Disable 2FA:", error);
    return NextResponse.json({ error: "Gagal mematikan 2FA" }, { status: 500 });
  }
}