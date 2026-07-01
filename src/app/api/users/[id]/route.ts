import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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

    // Proteksi: Mencegah admin menghapus dirinya sendiri
    if (session.user.id === id) {
      return NextResponse.json({ error: "Tidak dapat menghapus akun yang sedang digunakan" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Admin berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("Error DELETE User:", error);
    return NextResponse.json({ error: "Gagal menghapus admin" }, { status: 500 });
  }
}