"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Smartphone, ArrowLeft, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpToken, setOtpToken] = useState(""); // State untuk kode 6 digit
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false); // State untuk mendeteksi tampilan form

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Kita kirim email, password, dan token (jika ada)
    const res = await signIn("credentials", {
      email,
      password,
      token: otpToken, 
      redirect: false, 
    });

    if (res?.error) {
      setLoading(false);
      // Jika NextAuth mengirimkan error rahasia kita
      if (res.error === "2FA_REQUIRED") {
        setRequires2FA(true); // Ubah tampilan form ke mode 2FA
        setError(""); // Bersihkan pesan error
      } else {
        // Tampilkan error normal (misal: "Email atau password salah")
        setError(res.error);
      }
    } else {
      // Jika sukses tembus semuanya
      router.push("/admin");
      router.refresh();
    }
  };

  // Fungsi untuk kembali ke form password jika salah pencet
  const handleBackToLogin = () => {
    setRequires2FA(false);
    setOtpToken("");
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        
        {/* Header Dinamis */}
        <div className="flex flex-col items-center mb-8">
          <div className={`p-4 rounded-full text-white mb-4 shadow-md transition-colors ${requires2FA ? "bg-indigo-600" : "bg-green-600"}`}>
            {requires2FA ? <Smartphone size={28} /> : <Lock size={28} />}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {requires2FA ? "Verifikasi 2 Langkah" : "Login Admin"}
          </h1>
          <p className="text-slate-500 text-sm mt-2 text-center px-4">
            {requires2FA 
              ? "Buka aplikasi Google Authenticator di HP Anda dan masukkan 6 digit kode keamanan." 
              : "Sistem Manajemen Taylor CMS"}
          </p>
        </div>

        {/* Notifikasi Error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-200 text-center font-medium animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* TAMPILAN 1: Form Email & Password (Disembunyikan jika requires2FA true) */}
          {!requires2FA && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="admin@taylor.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </>
          )}

          {/* TAMPILAN 2: Form Kode 6 Digit (Muncul jika requires2FA true) */}
          {requires2FA && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 text-center">
                Kode Autentikator
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value)}
                className="w-full px-4 py-4 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-center text-3xl font-bold tracking-[0.5em] text-slate-700"
                placeholder="000000"
                autoFocus
              />
            </div>
          )}

          {/* Tombol Eksekusi Dinamis */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl text-white font-semibold transition-all shadow-md flex items-center justify-center gap-2 ${
              loading 
                ? "bg-slate-400 cursor-not-allowed" 
                : requires2FA ? "bg-indigo-600 hover:bg-indigo-700" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : null}
            {loading ? "Memproses..." : requires2FA ? "Verifikasi & Masuk" : "Masuk"}
          </button>

          {/* Tombol Batal untuk 2FA */}
          {requires2FA && (
            <button
              type="button"
              onClick={handleBackToLogin}
              disabled={loading}
              className="w-full py-3 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 transition font-medium"
            >
              <ArrowLeft size={16} /> Kembali
            </button>
          )}
        </form>
      </div>
    </div>
  );
}