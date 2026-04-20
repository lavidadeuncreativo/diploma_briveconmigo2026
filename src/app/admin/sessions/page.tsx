import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Calendar, Settings, Power, PowerOff } from "lucide-react";

export default async function SessionsPage() {
  const sessions = await prisma.session.findMany({
    include: {
      template: true,
      signer: true,
      _count: {
        select: { attendees: true, certificates: true }
      }
    },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-8 font-[family-name:var(--font-geist-sans)]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sessions & Webinars</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your events, attendee lists, and diploma status.</p>
        </div>
        <Link 
          href="/admin/sessions/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 font-bold"
        >
          <Plus className="w-4 h-4" />
          Create Session
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="px-8 py-5">Session Info</th>
              <th className="px-8 py-5">Validation</th>
              <th className="px-8 py-5">Attendees</th>
              <th className="px-8 py-5">Diplomas</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sessions.map((session) => (
              <tr key={session.id} className="hover:bg-slate-50/50 transition-all text-slate-700">
                <td className="px-8 py-6">
                  <div className="font-bold text-slate-900 text-base">{session.title}</div>
                  <div className="text-sm text-slate-400 mt-0.5 font-medium">{new Date(session.date).toLocaleDateString()} • {session.slug}</div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    session.validationMode === "FREE" ? "bg-green-50 text-green-600 border border-green-100" :
                    session.validationMode === "ATTENDEE_LIST" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                    "bg-purple-50 text-purple-600 border border-purple-100"
                  }`}>
                    {session.validationMode}
                  </span>
                </td>
                <td className="px-8 py-6 font-semibold">{session._count.attendees}</td>
                <td className="px-8 py-6 font-semibold">{session._count.certificates}</td>
                <td className="px-8 py-6">
                  {session.active ? (
                    <span className="flex items-center gap-2 text-green-600 text-xs font-bold">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                      <div className="w-2 h-2 rounded-full bg-slate-300" /> Inactive
                    </span>
                  )}
                </td>
                <td className="px-8 py-6 text-right">
                  <Link href={`/admin/sessions/${session.id}`} className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <Settings className="w-5 h-5" />
                  </Link>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-medium italic">
                  No sessions created yet. Create one to start generating diplomas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
