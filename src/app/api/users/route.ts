import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

// [GET] Mengambil daftar semua admin
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isTwoFactorEnabled: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error GET Users:", error);
    return NextResponse.json({ error: "Gagal mengambil data admin" }, { status: 500 });
  }
}

// [POST] Menambahkan admin baru
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    // Cek apakah email sudah terdaftar sebelumnya
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar di sistem" }, { status: 400 });
    }

    // Hash password sebelum disimpan ke database
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN"
      }
    });

    return NextResponse.json({ message: "Admin berhasil ditambahkan" }, { status: 201 });
  } catch (error) {
    console.error("Error POST User:", error);
    return NextResponse.json({ error: "Gagal menambah admin" }, { status: 500 });
  }
}