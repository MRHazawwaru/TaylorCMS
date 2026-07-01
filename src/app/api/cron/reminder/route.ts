import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendMail } from "@/lib/mail";

// API ini menggunakan method GET agar mudah dipanggil oleh layanan Cron
export async function GET(request: Request) {
  try {
    // 1. Lapisan Keamanan: Validasi rahasia Cron (mencegah akses publik)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Akses Ditolak" }, { status: 401 });
    }

    // 2. Kalkulasi Tanggal: Cari waktu 90 hari mundur dari hari ini
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // 3. Query Database: Cari semua Admin yang lastPasswordChange-nya LEBIH LAMA dari 90 hari yang lalu
    const targetUsers = await prisma.user.findMany({
      where: {
        lastPasswordChange: {
          lte: ninetyDaysAgo, // lte = less than or equal (lebih kecil/lama dari batas waktu)
        },
      },
    });

    if (targetUsers.length === 0) {
      return NextResponse.json({ message: "Semua admin aman. Tidak ada email dikirim." }, { status: 200 });
    }

    // 4. Eksekusi Pengiriman Email ke masing-masing admin
    for (const user of targetUsers) {
      const emailSubject = "⚠️ Peringatan Keamanan: Waktunya Mengganti Password Anda";
      const emailHtml = `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #1e293b;">Halo, ${user.name}</h2>
          <p style="color: #475569; line-height: 1.6;">
            Sistem keamanan Taylor CMS mendeteksi bahwa Anda belum mengganti password selama lebih dari 3 bulan (90 hari).
          </p>
          <p style="color: #475569; line-height: 1.6;">
            Untuk menjaga keamanan data perusahaan, kami mewajibkan pembaruan kredensial secara berkala. Mohon segera login ke Dashboard dan perbarui password Anda di menu <strong>Keamanan Admin</strong>.
          </p>
          <a href="${process.env.NEXTAUTH_URL}/admin/settings" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 20px;">
            Perbarui Password Sekarang
          </a>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #94a3b8; font-size: 12px;">Email ini dikirim otomatis oleh sistem Taylor CMS. Harap jangan membalas email ini.</p>
        </div>
      `;

      await sendMail(user.email, emailSubject, emailHtml);
    }

    return NextResponse.json({ 
      message: "Proses Cron berhasil dijalankan", 
      emailsSent: targetUsers.length 
    }, { status: 200 });

  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Gagal menjalankan Cron" }, { status: 500 });
  }
}