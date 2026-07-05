import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache"; // <-- IMPORT TAMBAHAN

// [PUBLIK/PRIVAT] Ambil 1 spesifik data galeri untuk Form Edit
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    const portfolio = await prisma.portfolio.findUnique({ where: { id } });
    if (!portfolio) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });

    return NextResponse.json(portfolio, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// [PRIVAT] Edit data galeri
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    const { title, imageUrl } = body;

    const updatedPortfolio = await prisma.portfolio.update({
      where: { id },
      data: { title, imageUrl },
    });

    // 🔥 Hancurkan cache landing page setelah edit foto sukses
    revalidatePath("/");

    return NextResponse.json(updatedPortfolio, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengupdate data galeri" }, { status: 500 });
  }
}

// [PRIVAT] Hapus data galeri
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;

    await prisma.portfolio.delete({ where: { id } });
    
    // 🔥 Hancurkan cache landing page setelah hapus foto sukses
    revalidatePath("/");

    return NextResponse.json({ message: "Berhasil dihapus" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}