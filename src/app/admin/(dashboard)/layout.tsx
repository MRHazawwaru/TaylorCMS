import Sidebar from "@/components/shared/Sidebar";
import PasswordReminderBanner from "@/components/shared/PasswordReminderBanner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar statis di sebelah kiri */}
      <Sidebar />
      
      {/* Area utama dibagi menjadi Kolom agar Banner bisa menempel di atas (Sticky) */}
      <main className="flex-1 flex flex-col h-full relative">
        {/* Banner akan muncul di sini jika syarat terpenuhi */}
        <PasswordReminderBanner />
        
        {/* Area konten yang bisa di-scroll bebas */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}