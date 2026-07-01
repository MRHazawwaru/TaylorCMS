"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import Link from "next/link";

export default function PasswordReminderBanner() {
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [daysPassed, setDaysPassed] = useState(0);

  useEffect(() => {
    // Cek apakah banner sudah ditutup oleh user di sesi browser ini
    const isDismissed = sessionStorage.getItem("dismissPasswordReminder");
    if (isDismissed === "true") return;

    if (session?.user?.lastPasswordChange) {
      const lastChangeDate = new Date(session.user.lastPasswordChange);
      const today = new Date();
      
      // Kalkulasi selisih hari
      const diffTime = Math.abs(today.getTime() - lastChangeDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Jika lebih dari 90 hari, munculkan banner (Untuk testing, kamu bisa ganti 90 jadi 0)
      if (diffDays >= 90) {
        setDaysPassed(diffDays);
        setIsVisible(true);
      }
    }
  }, [session]);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("dismissPasswordReminder", "true");
  };

  return (
    <div className="bg-amber-100 border-b border-amber-200 px-6 py-3 flex items-center justify-between text-amber-800 shadow-sm relative z-50">
      <div className="flex items-center gap-3">
        <AlertTriangle size={20} className="text-amber-600 shrink-0" />
        <p className="text-sm font-medium">
          Keamanan: Anda belum mengganti password selama {daysPassed} hari. Segera perbarui untuk menjaga keamanan akun.
        </p>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <Link href="/admin/settings" className="text-sm font-bold text-amber-700 hover:text-amber-900 underline">
          Ganti Sekarang
        </Link>
        <button onClick={handleDismiss} className="p-1 hover:bg-amber-200 rounded-md transition text-amber-700" title="Tutup sementara">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}