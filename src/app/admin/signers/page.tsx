import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, User, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SignersPage() {
  const signers = await prisma.signer.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 font-[family-name:var(--font-geist-sans)]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Signers</h1>
          <p className="text-slate-500 font-medium mt-1">Manage instructors and directors who sign the diplomas.</p>
        </div>
        <Link 
          href="/admin/signers/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 font-bold"
        >
          <Plus className="w-4 h-4" />
          Add Signer
        </Link>
      </div>

      {signers.length === 0 ? (
        <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-16 text-center shadow-sm">
          <p className="text-slate-400 font-medium italic">No signers found. Add one to start assigning them to sessions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {signers.map((signer) => (
            <div key={signer.id} className="bg-white border border-slate-200 rounded-3xl p-8 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                  <User className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{signer.name}</h3>
                  <p className="text-sm text-slate-500 font-medium">{signer.position}</p>
                </div>
              </div>
              
              <div className="aspect-[2/1] bg-slate-50 rounded-2xl p-6 mb-6 flex items-center justify-center border border-slate-100">
                <img src={signer.signature} alt="Signature" className="max-h-full object-contain mix-blend-multiply opacity-80" />
              </div>

              <div className="flex justify-end gap-2">
                <button className="p-2 text-slate-300 hover:text-red-500 transition-all rounded-lg hover:bg-red-50">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
