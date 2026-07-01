"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, UserPlus, Shield, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isTwoFactorEnabled: boolean;
};

export default function UsersManagementPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin mencabut akses admin dari "${name}"?`)) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        // Hapus dari state layar jika sukses di database
        setUsers((prev) => prev.filter((user) => user.id !== id));
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Gagal menghapus admin.");
      }
    } catch (error) {
      console.error("Error delete:", error);
      alert("Terjadi kesalahan pada server.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Shield className="text-blue-600" size={32} />
            Kelola Admin
          </h1>
          <p className="text-slate-500 mt-1">Daftarkan dan kelola akses pengguna sistem CMS</p>
        </div>
        <Link
          href="/admin/users/add"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg transition-colors font-medium shadow-sm"
        >
          <UserPlus size={20} /> Tambah Admin
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-100">
              <th className="py-4 px-6 font-semibold">Nama & Email</th>
              <th className="py-4 px-6 font-semibold">Status 2FA</th>
              <th className="py-4 px-6 font-semibold text-center w-32">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={3} className="py-12 text-center">
                  <Loader2 className="animate-spin mx-auto text-blue-600 mb-2" size={24} />
                  <p className="text-slate-500">Memuat data...</p>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-12 text-center text-slate-500">Belum ada data admin.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-800">{u.name}</p>
                    <p className="text-sm text-slate-500">{u.email}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.isTwoFactorEnabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {u.isTwoFactorEnabled ? "✅ Aktif" : "Mati"}
                    </span>
                  </td>
                  <td className="py-4 px-6 flex justify-center">
                    {/* Sembunyikan tombol hapus jika ini adalah akun yang sedang login */}
                    {session?.user?.id !== u.id ? (
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Hak Akses"
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded-md">Akun Anda</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}