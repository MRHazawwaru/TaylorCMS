"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Save, Building2 } from "lucide-react";

// 1. Skema Validasi Zod
const companySchema = z.object({
  name: z.string().min(3, "Nama perusahaan minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export default function CompanyInfoPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState(""); // Untuk notifikasi sukses hijau

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
  });

  // 2. Load data pertama kali halaman dibuka
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await fetch("/api/company");
        if (res.ok) {
          const data = await res.json();
          // Masukkan data ke dalam input form
          reset({
            name: data.name || "",
            description: data.description || "",
            address: data.address || "",
            phone: data.phone || "",
            email: data.email || "",
          });
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, [reset]);

  // 3. Eksekusi penyimpanan data ke API
  const onSubmit = async (data: CompanyFormValues) => {
    setIsSubmitting(true);
    setSuccessMsg("");
    
    try {
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccessMsg("Informasi perusahaan berhasil diperbarui!");
        // Hilangkan notifikasi hijau setelah 3 detik
        setTimeout(() => setSuccessMsg(""), 3000); 
      } else {
        alert("Gagal memperbarui informasi.");
      }
    } catch (error) {
      console.error("Error submit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Building2 size={32} className="text-blue-600" />
          Informasi Perusahaan
        </h1>
        <p className="text-slate-500 mt-1">Kelola data kontak dan profil utama perusahaan di sini</p>
      </div>

      {/* Alert Sukses */}
      {successMsg && (
        <div className="mb-6 bg-emerald-50 text-emerald-600 px-4 py-3 rounded-lg border border-emerald-200 font-medium text-sm animate-pulse">
          {successMsg}
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nama Perusahaan <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name")}
              type="text"
              className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Deskripsi Singkat <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("description")}
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
            ></textarea>
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nomor Telepon/WhatsApp
              </label>
              <input
                {...register("phone")}
                type="text"
                className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Alamat Lengkap
            </label>
            <textarea
              {...register("address")}
              rows={2}
              className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
            ></textarea>
          </div>

          <hr className="border-slate-100" />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-8 py-2.5 rounded-lg transition-colors font-medium shadow-sm"
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