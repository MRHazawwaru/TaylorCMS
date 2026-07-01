import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminDashboard() {
  // Menarik data user yang sedang login dari server secara langsung
  const session = await getServerSession(authOptions);

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
      <p className="text-slate-500 mb-8">
        Selamat datang kembali, <span className="font-semibold text-blue-600">{session?.user?.name || 'Admin'}</span>.
      </p>

      {/* Kartu Informasi Singkat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-slate-500 text-sm font-medium mb-1">Status Sistem</h3>
          <p className="text-2xl font-bold text-emerald-600">Online & Aman</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-slate-500 text-sm font-medium mb-1">Akses Saat Ini</h3>
          <p className="text-lg font-bold text-slate-800">{session?.user?.email}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-slate-500 text-sm font-medium mb-1">Role</h3>
          <p className="text-lg font-bold text-slate-800">
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
              {session?.user?.role}
            </span>
          </p>
        </div>
      </div>

      {/* Panduan Singkat */}
      <div className="mt-8 bg-green-100 border border-blue-100 p-6 rounded-2xl">
        <h2 className="text-blue-800 font-bold text-lg mb-2">👋 Panduan Penggunaan</h2>
        <p className="text-blue-700 text-sm leading-relaxed mb-4">
          Ini adalah pusat kendali (CMS) untuk website company profile Taylor. Gunakan menu di sebelah kiri untuk mengelola data:
        </p>
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
          <li><strong>Company Info:</strong> Mengubah nama, deskripsi, alamat, dan kontak perusahaan.</li>
          <li><strong>Services:</strong> Menambah, mengubah, dan menghapus layanan jahitan.</li>
          <li><strong>Portfolios:</strong> Mengunggah foto-foto hasil jahitan sebagai galeri.</li>
        </ul>
      </div>
    </div>
  );
}