"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon } from "lucide-react";

type Portfolio = {
  id: string;
  title: string;
  imageUrl: string | null;
};

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPortfolios = async () => {
    try {
      const res = await fetch("/api/portfolios");
      if (res.ok) {
        const data = await res.json();
        setPortfolios(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus foto "${title}" dari galeri?`)) return;

    try {
      const res = await fetch(`/api/portfolios/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPortfolios((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("Gagal menghapus data.");
      }
    } catch (error) {
      console.error("Error delete:", error);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  return (
    <div className="max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Galeri Portofolio</h1>
          <p className="text-slate-500 mt-1">Kelola foto hasil karya jahitan perusahaan</p>
        </div>
        <Link
          href="/admin/portfolios/add"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg transition-colors font-medium shadow-sm"
        >
          <Plus size={20} />
          Tambah Foto
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-100">
                <th className="py-4 px-6 font-semibold w-24">Preview</th>
                <th className="py-4 px-6 font-semibold">Judul Foto</th>
                <th className="py-4 px-6 font-semibold">URL Link</th>
                <th className="py-4 px-6 font-semibold text-center w-32">Aksi</th>
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
              ) : portfolios.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    Belum ada foto di galeri.
                  </td>
                </tr>
              ) : (
                portfolios.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      {item.imageUrl ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400">
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-800">{item.title}</td>
                    <td className="py-4 px-6 text-slate-500 text-xs truncate max-w-xs">
                      {item.imageUrl || "Tidak ada link"}
                    </td>
                    <td className="py-4 px-6 flex justify-center gap-3">
                      <Link
                        href={`/admin/portfolios/${item.id}/edit`}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
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