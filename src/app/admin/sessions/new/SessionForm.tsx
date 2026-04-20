"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

interface Props {
  templates: any[];
  signers: any[];
}

export default function SessionForm({ templates, signers }: Props) {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    subtitle: "",
    date: new Date().toISOString().split("T")[0],
    duration: "",
    solution: "",
    templateId: templates[0]?.id || "",
    signerId: signers[0]?.id || "",
    validationMode: "FREE",
    primaryColor: "#000000",
    secondaryColor: "#e2e8f0",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date).toISOString(),
        }),
      });

      if (res.ok) {
        router.push("/admin/sessions");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-2">General Info</h3>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Session Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Slug (URL)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-2">Appearance & Assets</h3>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Template</label>
            <select
              value={formData.templateId}
              onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
              required
            >
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Signer</label>
            <select
              value={formData.signerId}
              onChange={(e) => setFormData({ ...formData, signerId: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
              required
            >
              {signers.map(s => <option key={s.id} value={s.id}>{s.name} - {s.position}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Validation Mode</label>
            <select
              value={formData.validationMode}
              onChange={(e) => setFormData({ ...formData, validationMode: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
              required
            >
              <option value="FREE">Free (Anyone can register)</option>
              <option value="ATTENDEE_LIST">Attendee List (Must be in CSV)</option>
              <option value="TOKEN">Token (Unique code required)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-xl flex items-center gap-2 transition-all"
        >
          <Save className="w-5 h-5" />
          {loading ? "Creating..." : "Save Session"}
        </button>
      </div>
    </form>
  );
}
