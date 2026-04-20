import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";

export default async function TemplatesPage() {
  const templates = await prisma.diplomaTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 font-[family-name:var(--font-geist-sans)]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Diploma Templates</h1>
          <p className="text-slate-500 font-medium mt-1">Manage backgrounds and dynamic field layouts.</p>
        </div>
        <Link 
          href="/admin/templates/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 font-bold"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-16 text-center shadow-sm">
          <p className="text-slate-400 font-medium italic">No templates found. Create your first one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => (
            <div key={template.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden group hover:border-blue-500 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
              <div className="aspect-[1.414] bg-slate-50 relative">
                <img 
                  src={template.backgroundImage} 
                  alt={template.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-white/80 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-4 backdrop-blur-sm">
                  <Link href={`/admin/templates/${template.id}`} className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg transition-all transform hover:scale-110">
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button className="p-3 bg-red-50 text-red-600 rounded-full hover:bg-red-600 hover:text-white shadow-lg transition-all transform hover:scale-110 border border-red-100">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900">{template.name}</h3>
                <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">Created {new Date(template.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
