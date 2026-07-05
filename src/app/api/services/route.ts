import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// [PUBLIK] Endpoint untuk mengambil semua data layanan
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(services, { status: 200 });
  } catch (error) {
    console.error("Error GET Services:", error);
    return NextResponse.json({ error: "Gagal mengambil data layanan" }, { status: 500 });
  }
}

// [PRIVAT] Tambah data layanan
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, price, imageUrl } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Judul dan Deskripsi wajib diisi." }, { status: 400 });
    }

    const newService = await prisma.service.create({
      data: { title, description, price, imageUrl },
    });

    revalidatePath("/");

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error("Error POST Service:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}