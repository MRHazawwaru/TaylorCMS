import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// [PUBLIK] Ambil semua data galeri
export async function GET() {
  try {
    const portfolios = await prisma.portfolio.findMany({
      orderBy: { createdAt: 'desc' }, 
    });
    return NextResponse.json(portfolios, { status: 200 });
  } catch (error) {
    console.error("Error GET Portfolios:", error);
    return NextResponse.json({ error: "Gagal mengambil data galeri" }, { status: 500 });
  }
}

// [PRIVAT] Tambah foto ke galeri
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, imageUrl } = body;

    if (!title) {
      return NextResponse.json({ error: "Judul foto wajib diisi." }, { status: 400 });
    }

    const newPortfolio = await prisma.portfolio.create({
      data: { title, imageUrl },
    });

    revalidatePath("/");

    return NextResponse.json(newPortfolio, { status: 201 });
  } catch (error) {
    console.error("Error POST Portfolio:", error);
    return NextResponse.json({ error: "Gagal menambah data galeri" }, { status: 500 });
  }
}