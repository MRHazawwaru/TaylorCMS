"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Save, ShieldAlert, Smartphone, QrCode } from "lucide-react";

const passwordSchema = z.object({
  oldPassword: z.string().min(1, "Password lama wajib diisi"),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
  confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok dengan password baru",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  // --- STATE PASSWORD ---
  const [isSubmittingPwd, setIsSubmittingPwd] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // --- STATE 2FA ---
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
  const [otpToken, setOtpToken] = useState("");
  const [isProcessing2FA, setIsProcessing2FA] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

// Mengecek status 2FA asli dari database saat halaman dimuat
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/settings/2fa/status");
        if (res.ok) {
          const data = await res.json();
          // Mengubah UI secara otomatis berdasarkan data asli database
          setIs2FAEnabled(data.isTwoFactorEnabled);
        }
      } catch (error) {
        console.error("Gagal memuat status 2FA", error);
      }
    };
    
    checkStatus();
  }, []);

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsSubmittingPwd(true);
    setSuccessMsg(""); setErrorMsg("");
    try {
      const res = await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: data.oldPassword, newPassword: data.newPassword }),
      });
      const result = await res.json();
      if (res.ok) {
        setSuccessMsg("Password berhasil diubah!");
        reset();
      } else {
        setErrorMsg(result.error || "Gagal mengubah password.");
      }
    } catch (error) {
      setErrorMsg("Terjadi kesalahan pada server.");
    } finally {
      setIsSubmittingPwd(false);
    }
  };

  // FUNGSI 2FA: Menampilkan QR Code
  const handleSetup2FA = async () => {
    setIsProcessing2FA(true);
    try {
      const res = await fetch("/api/settings/2fa");
      if (res.ok) {
        const data = await res.json();
        setQrCodeData(data); // Simpan gambar QR Code
      }
    } catch (error) {
      alert("Gagal memuat QR Code");
    } finally {
      setIsProcessing2FA(false);
    }
  };

  // FUNGSI 2FA: Verifikasi & Aktifkan
  const handleEnable2FA = async () => {
    if (!otpToken || otpToken.length !== 6) return alert("Masukkan 6 digit kode dengan benar");
    setIsProcessing2FA(true);
    try {
      const res = await fetch("/api/settings/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: otpToken, secret: qrCodeData?.secret }),
      });
      const result = await res.json();
      if (res.ok) {
        setIs2FAEnabled(true);
        setQrCodeData(null);
        setOtpToken("");
        alert("2FA Berhasil diaktifkan!");
      } else {
        alert(result.error || "Kode salah.");
      }
    } catch (error) {
      alert("Error memproses 2FA");
    } finally {
      setIsProcessing2FA(false);
    }
  };

  // FUNGSI 2FA: Matikan
  const handleDisable2FA = async () => {
    if (!confirm("Yakin ingin mematikan keamanan lapis ganda?")) return;
    setIsProcessing2FA(true);
    try {
      const res = await fetch("/api/settings/2fa", { method: "DELETE" });
      if (res.ok) {
        setIs2FAEnabled(false);
        alert("2FA telah dimatikan.");
      }
    } catch (error) {
      alert("Gagal mematikan 2FA");
    } finally {
      setIsProcessing2FA(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <ShieldAlert size={32} className="text-blue-600" /> Pengaturan Keamanan
        </h1>
        <p className="text-slate-500 mt-1">Kelola kredensial akun dan perbarui password secara berkala</p>
      </div>

      {successMsg && <div className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-lg border border-emerald-200">{successMsg}</div>}
      {errorMsg && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200">{errorMsg}</div>}

      {/* --- FORM PASSWORD --- */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Ubah Password</h2>
        <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password Lama</label>
            <input {...register("oldPassword")} type="password" className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            {errors.oldPassword && <p className="text-red-500 text-sm mt-1">{errors.oldPassword.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password Baru</label>
              <input {...register("newPassword")} type="password" className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password Baru</label>
              <input {...register("confirmPassword")} type="password" className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={isSubmittingPwd} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-8 py-2.5 rounded-lg font-medium shadow-sm">
              {isSubmittingPwd ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Simpan Password
            </button>
          </div>
        </form>
      </div>

      {/* --- KOTAK 2FA --- */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><Smartphone size={28} /></div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800">Autentikasi 2 Langkah (2FA)</h2>
            <p className="text-slate-500 mt-1 text-sm leading-relaxed">
              Tambahkan lapisan keamanan ekstra. Saat login, Anda akan diminta memasukkan kode 6 digit dari aplikasi Google Authenticator.
            </p>

            <div className="mt-6">
              {is2FAEnabled ? (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
                  <span className="font-semibold text-emerald-700">✅ 2FA Sedang Aktif</span>
                  <button onClick={handleDisable2FA} disabled={isProcessing2FA} className="px-4 py-2 bg-red-100 text-red-600 font-medium rounded-lg hover:bg-red-200">
                    Matikan
                  </button>
                </div>
              ) : qrCodeData ? (
                <div className="border border-slate-200 p-6 rounded-xl text-center bg-slate-50">
                  <p className="font-medium text-slate-700 mb-4">1. Scan QR Code ini menggunakan aplikasi Authenticator</p>
                  <div className="bg-white p-4 inline-block rounded-xl shadow-sm border border-slate-200 mb-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCodeData.qrCodeUrl} alt="QR Code 2FA" className="w-40 h-40" />
                  </div>
                  <p className="font-medium text-slate-700 mb-2">2. Masukkan kode 6 digit yang muncul di HP Anda</p>
                  <div className="flex justify-center gap-3 max-w-xs mx-auto">
                    <input 
                      type="text" maxLength={6} value={otpToken} onChange={(e) => setOtpToken(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-center tracking-widest text-lg font-bold outline-none focus:border-indigo-500" placeholder="000000" 
                    />
                    <button onClick={handleEnable2FA} disabled={isProcessing2FA} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700">
                      Aktifkan
                    </button>
                  </div>
                  <button onClick={() => setQrCodeData(null)} className="mt-6 text-sm text-slate-500 underline">Batal Setup</button>
                </div>
              ) : (
                <button onClick={handleSetup2FA} disabled={isProcessing2FA} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800">
                  <QrCode size={18} /> Setup 2FA Sekarang
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}