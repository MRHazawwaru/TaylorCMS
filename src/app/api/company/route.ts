import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache"; // <-- IMPORT TAMBAHAN

// [PUBLIK] Ambil data perusahaan (digunakan untuk Admin Form & Landing Page nanti)
export async function GET() {
  try {
    const company = await prisma.companyInfo.findFirst();
    
    if (!company) {
      return NextResponse.json({ error: "Data perusahaan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(company, { status: 200 });
  } catch (error) {
    console.error("Error GET Company:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// [PRIVAT] Update data perusahaan
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, address, phone, email } = body;

    const existingCompany = await prisma.companyInfo.findFirst();

    if (!existingCompany) {
      return NextResponse.json({ error: "Data perusahaan belum di-seed" }, { status: 400 });
    }

    const updatedCompany = await prisma.companyInfo.update({
      where: { id: existingCompany.id },
      data: { name, description, address, phone, email },
    });

    // 🔥 Hancurkan cache landing page setelah update sukses
    revalidatePath("/");

    return NextResponse.json(updatedCompany, { status: 200 });
  } catch (error) {
    console.error("Error PUT Company:", error);
    return NextResponse.json({ error: "Gagal menyimpan data perusahaan" }, { status: 500 });
  }
}