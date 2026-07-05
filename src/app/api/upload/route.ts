import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

// Konfigurasi koneksi ke Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    // 1. Cek keamanan, pastikan yang mengupload adalah Admin (Keamananmu dipertahankan!)
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Tangkap data file yang dikirim dari form (FormData)
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    // 3. Konversi file fisik menjadi bentuk Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Proses pengiriman data ke server Cloudinary (MENGGANTIKAN fs lokal)
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "taylor_cms_portfolios" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      ).end(buffer);
    });

    // 5. Kembalikan URL publik Cloudinary (https) agar bisa disimpan ke database
    return NextResponse.json({ url: (uploadResult as any).secure_url }, { status: 201 });

  } catch (error) {
    console.error("Error Upload API:", error);
    return NextResponse.json({ error: "Gagal mengunggah file ke Cloud" }, { status: 500 });
  }
}