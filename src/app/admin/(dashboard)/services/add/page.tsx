"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Loader2, Save } from "lucide-react";

// 1. Definisikan Skema Validasi menggunakan Zod
const serviceSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  price: z.string().optional(),
});

// Otomatis membuat tipe data TypeScript dari skema Zod di atas
type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function AddServicePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Inisialisasi React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
  });

  // 3. Fungsi yang dijalankan saat tombol Simpan ditekan dan validasi lolos
  const onSubmit = async (data: ServiceFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        // Jika berhasil, arahkan kembali ke halaman tabel data
        router.push("/admin/services");
        router.refresh(); // Memaksa Next.js menarik data terbaru
      } else {
        alert("Gagal menyimpan data.");
      }
    } catch (error) {
      console.error("Error submit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/services"
          className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Tambah Layanan</h1>
          <p className="text-slate-500 mt-1">Masukkan detail layanan jahit terbaru</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Input Judul */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nama Layanan <span className="text-red-500">*</span>
            </label>
            <input
              {...register("title")}
              type="text"
              className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Contoh: Jahit Jas Pria Dewasa"
            />
            {/* Pesan Error Validasi */}
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          {/* Input Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("description")}
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
              placeholder="Jelaskan detail layanannya di sini..."
            ></textarea>
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          {/* Input Harga */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Harga (Opsional)
            </label>
            <input
              {...register("price")}
              type="text"
              className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Contoh: Mulai dari Rp 150.000"
            />
          </div>

          <hr className="border-slate-100" />

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-3">
            <Link
              href="/admin/services"
              className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2.5 rounded-lg transition-colors font-medium shadow-sm"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSubmitting ? "Menyimpan..." : "Simpan Layanan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}