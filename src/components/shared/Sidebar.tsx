"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Scissors, ImageIcon, Building2, LogOut, Settings, Users } from "lucide-react";
import clsx from "clsx";

export default function Sidebar() {
  const pathname = usePathname(); // Untuk mendapatkan url saat ini

  // Daftar menu agar mudah ditambah/diedit
  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Company Info", href: "/admin/company", icon: Building2 },
    { name: "Services", href: "/admin/services", icon: Scissors },
    { name: "Portfolios", href: "/admin/portfolios", icon: ImageIcon },
    { name: "Kelola Admin", href: "/admin/users", icon: Users },
    { name: "Keamanan Admin", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-700 text-slate-300 min-h-screen flex flex-col transition-all">
      {/* Bagian Header Sidebar */}
      <div className="p-6 mb-4 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-green-600 p-2 rounded-lg text-white">
          <Scissors size={20} />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg leading-tight">Taylor CMS</h2>
          <p className="text-xs text-slate-400">Admin Panel</p>
        </div>
      </div>

      {/* Bagian Menu Navigasi */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Cek apakah url saat ini sama dengan url menu (untuk efek active)
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-green-600 text-white shadow-md shadow-blue-900/20" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon size={20} className={isActive ? "text-white" : "text-slate-400"} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bagian Footer Sidebar (Tombol Logout) */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}