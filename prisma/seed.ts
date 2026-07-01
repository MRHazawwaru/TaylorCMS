import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Enkripsi password untuk keamanan
  const hashedPassword = await bcrypt.hash('taylor123', 10);

  // 2. Buat akun Admin menggunakan metode 'upsert'
  const admin = await prisma.user.upsert({
    where: { email: 'admin@taylor.com' },
    update: {}, // Jika sudah ada, jangan lakukan apa-apa
    create: {
      name: 'Admin Taylor',
      email: 'admin@taylor.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // 3. Buat data profil perusahaan default
  const company = await prisma.companyInfo.upsert({
    where: { id: 'default-company-info' }, // Pakai ID statis agar mudah dicari
    update: {},
    create: {
      id: 'default-company-info',
      name: 'Home Industry Taylor',
      description: 'Menyediakan layanan jahit profesional, rapi, dan berkualitas tinggi untuk segala kebutuhan busana Anda.',
      address: 'Jl. Penjahit Hebat No. 1, Kota Suka Maju',
      phone: '081234567890',
      email: 'hello@taylor.com',
    },
  });

  console.log('✅ Seeding berhasil!');
  console.log({ admin, company });
}

main()
  .catch((e) => {
    console.error('❌ Gagal melakukan seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });