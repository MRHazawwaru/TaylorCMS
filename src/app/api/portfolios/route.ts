import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache"; // <-- IMPORT TAMBAHAN

// [PUBLIK/PRIVAT] Endpoint untuk mengambil 1 data layanan secara spesifik
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(service, { status: 200 });
  } catch (error) {
    console.error("Error GET Single Service:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// [PRIVAT] Endpoint untuk Edit data layanan
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
    const { title, description, price, imageUrl } = body;

    const updatedService = await prisma.service.update({
      where: { id },
      data: { title, description, price, imageUrl },
    });

    // 🔥 Hancurkan cache landing page setelah edit sukses
    revalidatePath("/");

    return NextResponse.json(updatedService, { status: 200 });
  } catch (error) {
    console.error("Error PUT Service:", error);
    return NextResponse.json({ error: "Gagal mengupdate data layanan" }, { status: 500 });
  }
}

// [PRIVAT] Endpoint untuk Hapus data layanan
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

    await prisma.service.delete({
      where: { id },
    });

    // 🔥 Hancurkan cache landing page setelah hapus sukses
    revalidatePath("/");

    return NextResponse.json({ message: "Layanan berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("Error DELETE Service:", error);
    return NextResponse.json({ error: "Gagal menghapus data layanan" }, { status: 500 });
  }
}