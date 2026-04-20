import { prisma } from "@/lib/prisma";
import { PlusCircle, Calendar, Users, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminSessionsPage() {
  const sessions = await prisma.session.findMany({
    orderBy: { date: "desc" },
    include: {
      _count: {
        select: { attendees: true, certificates: true }
      }
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Sessions</h1>
          <p className="text-slate-400 mt-1">Manage your webinars and events.</p>
        </div>
        <Link 
          href="/admin/sessions/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 font-bold"
        >
          <PlusCircle className="w-5 h-5" />
          Create Session
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <div 
            key={session.id} 
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-800 rounded-xl text-blue-400">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex gap-2">
                <Link 
                  href={`/s/${session.slug}`} 
                  target="_blank"
                  className="p-2 text-slate-500 hover:text-blue-400 transition-colors"
                  title="View Landing Page"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${session.active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {session.active ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {session.title}
            </h3>
            <p className="text-slate-500 text-sm mb-6 line-clamp-2">{session.subtitle}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-800/50 rounded-xl p-3">
                <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Attendees</div>
                <div className="text-white font-bold flex items-center gap-2">
                  <Users className="w-3 h-3 text-slate-400" />
                  {session._count.attendees}
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3">
                <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Generated</div>
                <div className="text-white font-bold">
                  {session._count.certificates}
                </div>
              </div>
            </div>

            <Link 
              href={`/admin/sessions/${session.id}`}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-sm"
            >
              Manage Session
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl p-16 text-center">
          <p className="text-slate-500 italic">No sessions found. Create your first one to get started!</p>
        </div>
      )}
    </div>
  );
}
