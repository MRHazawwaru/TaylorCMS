import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // 1. Cek keamanan, pastikan yang mengupload adalah Admin
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

    // 3. Konversi file fisik menjadi bentuk Buffer agar bisa disimpan oleh Node.js
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Buat nama file unik (gabungan waktu sekarang dan nama asli file, spasi diganti strip)
    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    // 5. Tentukan lokasi folder penyimpanan (public/uploads)
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // 6. Jika folder uploads belum ada, buat foldernya secara otomatis
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 7. Tulis dan simpan file ke direktori tersebut
    const filePath = path.join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    // 8. Kembalikan URL path file tersebut agar bisa disimpan ke database
    return NextResponse.json({ url: `/uploads/${uniqueName}` }, { status: 201 });

  } catch (error) {
    console.error("Error Upload API:", error);
    return NextResponse.json({ error: "Gagal mengunggah file" }, { status: 500 });
  }
}