"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

// Mendefinisikan tipe data TypeScript sesuai dengan schema Prisma
type Service = {
  id: string;
  title: string;
  description: string;
  price: string | null;
  imageUrl: string | null;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fungsi untuk mengambil data dari API
  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      const data = await res.json();

      // 🛡️ BAJU ZIRAH 1: Pastikan data benar-benar Array
      if (res.ok && Array.isArray(data)) {
        setServices(data);
        setErrorMsg(null);
      } else {
        console.error("API error atau bukan array:", data);
        setServices([]); 
        setErrorMsg("Gagal memuat data layanan dari server.");
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      setServices([]);
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menghapus data
  const handleDelete = async (id: string, title: string) => {
    // Memberikan konfirmasi agar Admin tidak tidak sengaja menghapus data
    if (!confirm(`Apakah Anda yakin ingin menghapus layanan "${title}"?`)) return;

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Jika berhasil di database, hapus juga dari tampilan tabel (state) tanpa perlu refresh browser
        setServices((prev) => prev.filter((service) => service.id !== id));
      } else {
        alert("Gagal menghapus data.");
      }
    } catch (error) {
      console.error("Error delete:", error);
    }
  };

  // Panggil fetchServices saat halaman pertama kali dimuat
  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Layanan Jahit</h1>
          <p className="text-slate-500 mt-1">Kelola daftar layanan yang ditawarkan perusahaan</p>
        </div>
        <Link
          href="/admin/services/add"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg transition-colors font-medium shadow-sm"
        >
          <Plus size={20} />
          Tambah Layanan
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-100">
                <th className="py-4 px-6 font-semibold">Nama Layanan</th>
                <th className="py-4 px-6 font-semibold">Deskripsi Singkat</th>
                <th className="py-4 px-6 font-semibold">Harga</th>
                <th className="py-4 px-6 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    <Loader2 className="animate-spin mx-auto mb-2 text-blue-600" size={24} />
                    Memuat data...
                  </td>
                </tr>
              ) : errorMsg ? (
                // 🛡️ BAJU ZIRAH 2: Tampilkan pesan error jika server sedang sibuk/menolak
                <tr>
                  <td colSpan={4} className="py-12 text-center text-red-500 font-medium">
                    {errorMsg}
                  </td>
                </tr>
              ) : !Array.isArray(services) || services.length === 0 ? (
                // 🛡️ BAJU ZIRAH 3: Validasi kuat agar .map tidak meledak
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    Belum ada data layanan. Silakan tambah baru.
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-800">{service.title}</td>
                    <td className="py-4 px-6 text-slate-600 text-sm truncate max-w-xs">
                      {service.description}
                    </td>
                    <td className="py-4 px-6 text-slate-600 text-sm">
                      {service.price || "-"}
                    </td>
                    <td className="py-4 px-6 flex justify-center gap-3">
                      <Link
                        href={`/admin/services/${service.id}/edit`}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(service.id, service.title)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}