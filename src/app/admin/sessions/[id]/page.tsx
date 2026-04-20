import { prisma } from "@/lib/prisma";
import { ChevronLeft, Users, Download, Trash2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import AttendeeUpload from "./AttendeeUpload";

export default async function SessionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      template: true,
      signer: true,
      attendees: { orderBy: { email: "asc" } },
      _count: { select: { certificates: true } }
    }
  });

  if (!session) return <div>Session not found</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/sessions" className="p-2 hover:bg-slate-800 rounded-full transition-all text-slate-400">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">{session.title}</h1>
            <p className="text-slate-400">{session.slug} • {new Date(session.date).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Attendees" value={session.attendees.length} icon={<Users />} color="blue" />
        <StatCard title="Diplomas Generated" value={session._count.certificates} icon={<CheckCircle />} color="green" />
        <StatCard title="Validation Mode" value={session.validationMode} icon={<SettingsIcon />} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-semibold text-white">Attendee List</h3>
              <span className="text-xs text-slate-500">{session.attendees.length} records</span>
            </div>
            <div className="max-h-[500px] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/50 sticky top-0">
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Validated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {session.attendees.map(a => (
                    <tr key={a.id} className="text-slate-300">
                      <td className="px-4 py-3">{a.email}</td>
                      <td className="px-4 py-3">{a.name || "-"}</td>
                      <td className="px-4 py-3">
                        {a.validated ? <span className="text-green-500">Yes</span> : <span className="text-slate-500">No</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">Upload Attendees</h3>
            <p className="text-xs text-slate-500 mb-4">Upload a CSV file with "email" and "name" columns to populate the valid attendee list for this session.</p>
            <AttendeeUpload sessionId={session.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-2">
      <div className="text-slate-500 flex items-center justify-between">
        <span className="text-xs font-medium uppercase">{title}</span>
        <div className={`text-${color}-500 opacity-50`}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function SettingsIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>; }
