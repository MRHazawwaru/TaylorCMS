"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Loader2, Save, UploadCloud, Link as LinkIcon } from "lucide-react";

// Skema Zod dimodifikasi sedikit karena validasi URL akan dinamis
const portfolioSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  imageUrl: z.string().optional().or(z.literal("")),
});

type PortfolioFormValues = z.infer<typeof portfolioSchema>;

export default function AddPortfolioPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"local" | "url">("local");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewLocal, setPreviewLocal] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioSchema),
  });

  const watchImageUrl = watch("imageUrl");

  // Fungsi untuk menangani saat admin memilih file dari komputer
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi ukuran maksimal (contoh: 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file maksimal 2MB");
        e.target.value = "";
        return;
      }
      setSelectedFile(file);
      // Membuat URL sementara untuk preview gambar lokal
      setPreviewLocal(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewLocal(null);
    }
  };

  const onSubmit = async (data: PortfolioFormValues) => {
    setIsSubmitting(true);
    try {
      let finalImageUrl = data.imageUrl;

      // ALUR 1: Jika admin memilih upload dari komputer
      if (uploadMethod === "local") {
        if (!selectedFile) {
          setError("imageUrl", { message: "Silakan pilih file gambar dari komputer Anda" });
          setIsSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        // Tembak API Upload yang kita buat di Langkah 1
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Gagal upload gambar");
        const uploadData = await uploadRes.json();
        
        // Timpa variabel finalImageUrl dengan path dari file lokal
        finalImageUrl = uploadData.url; 
      } 
      // ALUR 2: Jika admin menggunakan URL, kita pastikan input tidak kosong jika diwajibkan
      else if (uploadMethod === "url" && !data.imageUrl) {
        setError("imageUrl", { message: "URL Link gambar wajib diisi" });
        setIsSubmitting(false);
        return;
      }

      // Setelah mendapatkan URL (entah dari lokal atau internet), eksekusi simpan ke database
      const res = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: data.title, imageUrl: finalImageUrl }),
      });

      if (res.ok) {
        router.push("/admin/portfolios");
        router.refresh();
      } else {
        alert("Gagal menyimpan foto ke galeri.");
      }
    } catch (error) {
      console.error("Error submit:", error);
      alert("Terjadi kesalahan saat memproses gambar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/portfolios" className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Tambah Portofolio</h1>
          <p className="text-slate-500 mt-1">Masukkan foto hasil karya jahitan terbaru</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Judul Foto <span className="text-red-500">*</span>
            </label>
            <input
              {...register("title")}
              type="text"
              className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Contoh: Jas Pernikahan Bapak X"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          {/* Pemilihan Metode Gambar */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Pilih Metode Gambar</label>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${uploadMethod === "local" ? "border-blue-600 bg-green-50 text-blue-700 font-semibold" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                <input type="radio" name="uploadMethod" value="local" checked={uploadMethod === "local"} onChange={() => setUploadMethod("local")} className="hidden" />
                <UploadCloud size={20} /> Upload dari Komputer
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${uploadMethod === "url" ? "border-blue-600 bg-green-50 text-blue-700 font-semibold" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                <input type="radio" name="uploadMethod" value="url" checked={uploadMethod === "url"} onChange={() => setUploadMethod("url")} className="hidden" />
                <LinkIcon size={20} /> Gunakan Link URL
              </label>
            </div>
          </div>

          {/* Area Input Berdasarkan Metode */}
          <div className="p-5 border border-slate-200 rounded-xl bg-slate-50">
            {uploadMethod === "local" ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pilih File Gambar (Maks 2MB)</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700" />
                
                {previewLocal && (
                  <div className="mt-4">
                    <p className="text-xs text-slate-500 mb-2 font-medium">Preview:</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewLocal} alt="Preview Lokal" className="h-40 rounded-lg object-cover shadow-sm border border-slate-200" />
                  </div>
                )}
                {errors.imageUrl && uploadMethod === "local" && <p className="text-red-500 text-sm mt-2">{errors.imageUrl.message}</p>}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tempel URL Gambar di sini</label>
                <input {...register("imageUrl")} type="text" className="w-full px-4 py-2 border text-slate-500 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://contoh.com/gambar.jpg" />
                
                {watchImageUrl && (
                  <div className="mt-4">
                    <p className="text-xs text-slate-500 mb-2 font-medium">Preview:</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={watchImageUrl} alt="Preview URL" className="h-40 rounded-lg object-cover shadow-sm border border-slate-200" onError={(e) => (e.currentTarget.style.display = "none")} />
                  </div>
                )}
                {errors.imageUrl && uploadMethod === "url" && <p className="text-red-500 text-sm mt-2">{errors.imageUrl.message}</p>}
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          <div className="flex justify-end gap-3">
            <Link href="/admin/portfolios" className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Batal</Link>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm">
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSubmitting ? "Menyimpan..." : "Simpan Foto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}