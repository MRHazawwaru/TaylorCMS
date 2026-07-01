import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Scissors, MapPin, Phone, Mail, CheckCircle2, ChevronRight } from "lucide-react";

export default async function Home() {
  // Mengambil data langsung dari database secara Server-Side!
  const companyInfo = await prisma.companyInfo.findFirst();
  const services = await prisma.service.findMany({ orderBy: { createdAt: "desc" } });
  const portfolios = await prisma.portfolio.findMany({ orderBy: { createdAt: "desc" } });

  // Fallback data jika database kosong (meskipun kita sudah seeding)
  const companyName = companyInfo?.name || "Home Industry Taylor";
  const companyDesc = companyInfo?.description || "Melayani jasa jahit profesional.";

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-xl">
            <Scissors size={28} />
            <span>{companyName}</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-slate-600 font-medium text-sm">
            <a href="#about" className="hover:text-blue-600 transition">Tentang Kami</a>
            <a href="#services" className="hover:text-blue-600 transition">Layanan</a>
            <a href="#portfolio" className="hover:text-blue-600 transition">Galeri</a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            Penerimaan Jahitan Buka
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mb-8">
            Kualitas Jahitan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Premium</span> untuk Penampilan Terbaikmu
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mb-10 leading-relaxed">
            {companyDesc}
          </p>
          <div className="flex gap-4">
            <a href="#services" className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 flex items-center gap-2">
              Lihat Layanan <ChevronRight size={20} />
            </a>
          </div>
        </div>
        {/* Dekorasi Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-400/20 blur-[120px] rounded-full -z-10"></div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Layanan Kami</h2>
            <p className="text-slate-500">Solusi tepat untuk segala kebutuhan busana Anda</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.id} className="bg-slate-50 border border-slate-100 rounded-3xl p-8 hover:shadow-xl hover:shadow-slate-200/50 transition duration-300 group">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                  <Scissors size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{service.title}</h3>
                <p className="text-slate-600 mb-6 line-clamp-3 leading-relaxed">
                  {service.description}
                </p>
                {service.price && (
                  <div className="flex items-center gap-2 text-blue-700 font-semibold bg-blue-50 w-max px-4 py-2 rounded-lg">
                    {service.price}
                  </div>
                )}
              </div>
            ))}
            {services.length === 0 && (
              <div className="col-span-full text-center text-slate-500 py-10">Belum ada layanan yang ditambahkan.</div>
            )}
          </div>
        </div>
      </section>

      {/* PORTFOLIO SECTION */}
      <section id="portfolio" className="py-24 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-3xl font-bold mb-4">Galeri Hasil Karya</h2>
              <p className="text-slate-400">Beberapa hasil jahitan terbaik yang telah kami kerjakan</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {portfolios.map((portfolio) => (
              <div key={portfolio.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-800 cursor-pointer">
                {portfolio.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={portfolio.imageUrl} 
                    alt={portfolio.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">No Image</div>
                )}
                {/* Overlay Hitam saat dihover */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-6">
                  <h3 className="font-bold text-white translate-y-4 group-hover:translate-y-0 transition duration-300">
                    {portfolio.title}
                  </h3>
                </div>
              </div>
            ))}
            {portfolios.length === 0 && (
              <div className="col-span-full text-center text-slate-500 py-10">Belum ada foto galeri.</div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER & CONTACT */}
      <footer id="about" className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-2 text-blue-700 font-bold text-2xl mb-6">
              <Scissors size={32} />
              <span>{companyName}</span>
            </div>
            <p className="text-slate-500 leading-relaxed max-w-sm mb-8">
              {companyDesc}
            </p>
            <div className="space-y-4 text-slate-600">
              {companyInfo?.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="text-blue-600 shrink-0 mt-1" size={20} />
                  <span>{companyInfo.address}</span>
                </div>
              )}
              {companyInfo?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="text-blue-600 shrink-0" size={20} />
                  <span>{companyInfo.phone}</span>
                </div>
              )}
              {companyInfo?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="text-blue-600 shrink-0" size={20} />
                  <span>{companyInfo.email}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-3xl p-8 md:p-10 border border-slate-100 flex flex-col justify-center">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Kenapa Memilih Kami?</h3>
            <ul className="space-y-4">
              {["Kualitas Jahitan Rapi & Presisi", "Harga Terjangkau & Transparan", "Ketepatan Waktu Pengerjaan", "Bisa Custom Model Sesuai Keinginan"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-16 pt-8 border-t border-slate-100 text-center text-slate-400 text-sm">
          ©{" "}
          <Link href="/admin" className="cursor-text outline-none">
            {new Date().getFullYear()}
          </Link>{" "}
          {companyName}. All rights reserved.
        </div>
      </footer>

    </div>
  );
}