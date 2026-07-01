import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// [PUBLIK] Endpoint untuk mengambil semua data layanan
export async function GET() {
  try {
    // Menarik semua data dari database, diurutkan dari yang paling baru dibuat
    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(services, { status: 200 });
  } catch (error) {
    console.error("Error GET Services:", error);
    return NextResponse.json({ error: "Gagal mengambil data layanan" }, { status: 500 });
  }
}

// [PRIVAT] Endpoint untuk menambah data layanan baru
export async function POST(request: Request) {
  try {
    // 1. Validasi Keamanan: Cek apakah yang melakukan request adalah Admin yang sedang login
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak. Anda bukan Admin." }, { status: 401 });
    }

    // 2. Ambil data yang dikirim dari form frontend
    const body = await request.json();
    const { title, description, price, imageUrl } = body;

    // 3. Validasi Data Kosong (Mencegah blank data masuk ke database)
    if (!title || !description) {
      return NextResponse.json({ error: "Judul dan Deskripsi wajib diisi." }, { status: 400 });
    }

    // 4. Eksekusi query tambah data ke MySQL
    const newService = await prisma.service.create({
      data: {
        title,
        description,
        price,
        imageUrl,
      },
    });

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error("Error POST Service:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server saat menambah data" }, { status: 500 });
  }
}