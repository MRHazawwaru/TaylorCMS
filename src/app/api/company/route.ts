import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// [PUBLIK] Ambil data perusahaan (digunakan untuk Admin Form & Landing Page nanti)
export async function GET() {
  try {
    // Kita gunakan findFirst() karena datanya cuma 1 baris di database
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

    // Cari dulu data pertama yang ada di database
    const existingCompany = await prisma.companyInfo.findFirst();

    if (!existingCompany) {
      return NextResponse.json({ error: "Data perusahaan belum di-seed" }, { status: 400 });
    }

    // Timpa (Update) data tersebut menggunakan ID-nya
    const updatedCompany = await prisma.companyInfo.update({
      where: { id: existingCompany.id },
      data: {
        name,
        description,
        address,
        phone,
        email,
      },
    });

    return NextResponse.json(updatedCompany, { status: 200 });
  } catch (error) {
    console.error("Error PUT Company:", error);
    return NextResponse.json({ error: "Gagal menyimpan data perusahaan" }, { status: 500 });
  }
}