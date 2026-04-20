import Link from "next/link";
import { LogOut, Layout, Users, Calendar, Image as ImageIcon } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-[family-name:var(--font-geist-sans)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white shadow-sm z-10">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layout className="w-5 h-5 text-blue-600" />
            Brivé Admin
          </h2>
        </div>
        
        <nav className="px-4 space-y-1 mt-4">
          <NavLink href="/admin/sessions" icon={<Calendar className="w-4 h-4" />} label="Sessions" />
          <NavLink href="/admin/templates" icon={<ImageIcon className="w-4 h-4" />} label="Templates" />
          <NavLink href="/admin/signers" icon={<Users className="w-4 h-4" />} label="Signers" />
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Link 
            href="/api/admin/logout" 
            className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-100 rounded-lg transition-all border border-transparent hover:border-slate-200 text-slate-600 hover:text-slate-900"
    >
      <span className="opacity-70">{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}
