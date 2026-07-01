"use client";

import { useState, useEffect, use } from "react"; // Tambahkan 'use' dari react
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Loader2, Save } from "lucide-react";

// 1. Skema validasi persis seperti form tambah
const serviceSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  price: z.string().optional().nullable(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  // 2. Gunakan hooks 'use()' untuk membuka Promise params (Standar Next.js 16)
  const { id } = use(params); 
  
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 3. Inisialisasi Form
  const {
    register,
    handleSubmit,
    reset, // Fungsi khusus untuk me-reset ulang/mengisi form
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
  });

  // 4. Tarik data lama dari database dan isikan ke dalam form
  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(`/api/services/${id}`);
        if (res.ok) {
          const data = await res.json();
          // Fungsi reset() akan memasukkan data API langsung ke dalam input box
          reset({
            title: data.title,
            description: data.description,
            price: data.price || "",
          });
        }
      } catch (error) {
        console.error("Gagal load data layanan", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchService();
  }, [id, reset]);

  // 5. Fungsi Update saat tombol Simpan ditekan
  const onSubmit = async (data: ServiceFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "PUT", // Kita tembak API menggunakan method PUT (Update)
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/admin/services");
        router.refresh();
      } else {
        alert("Gagal mengupdate data.");
      }
    } catch (error) {
      console.error("Error submit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tampilkan loading saat menarik data lama dari database
  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-slate-800">Edit Layanan</h1>
          <p className="text-slate-500 mt-1">Ubah informasi layanan jahit</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nama Layanan <span className="text-red-500">*</span>
            </label>
            <input
              {...register("title")}
              type="text"
              className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("description")}
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
            ></textarea>
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Harga (Opsional)
            </label>
            <input
              {...register("price")}
              type="text"
              className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <hr className="border-slate-100" />

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
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}