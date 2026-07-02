"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Loader2, Save } from "lucide-react";

// Skema Validasi
const userSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function AddAdminPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        router.push("/admin/users");
        router.refresh();
      } else {
        setErrorMsg(result.error || "Gagal menyimpan data admin.");
      }
    } catch (error) {
      console.error("Error submit:", error);
      setErrorMsg("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/users"
          className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Tambah Admin Baru</h1>
          <p className="text-slate-500 mt-1">Daftarkan akun baru untuk mengelola sistem Taylor CMS</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200 font-medium text-sm">
          {errorMsg}
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name")}
              type="text"
              className="w-full px-4 py-2 border text-slate-700 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Contoh: Arif Taylor"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Alamat Email <span className="text-red-500">*</span>
            </label>
            <input
              {...register("email")}
              type="email"
              className="w-full px-4 py-2 border text-slate-700 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="admin@taylor.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password Sementara <span className="text-red-500">*</span>
            </label>
            <input
              {...register("password")}
              type="password"
              className="w-full px-4 py-2 border text-slate-700 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Minimal 8 karakter"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <hr className="border-slate-100" />

          <div className="flex justify-end gap-3">
            <Link
              href="/admin/users"
              className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSubmitting ? "Menyimpan..." : "Simpan Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}