"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Save, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { put } from "@vercel/blob";

export default function NewTemplatePage() {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name) return;

    setLoading(true);
    try {
      // 1. Upload to Vercel Blob
      const response = await fetch(`/api/admin/templates/upload?filename=${file.name}`, {
        method: "POST",
        body: file,
      });
      const blob = await response.json();

      // 2. Save Template to DB
      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          backgroundImage: blob.url,
          layoutConfig: {
            name: { x: 50, y: 40, fontSize: 40, color: "#000000" },
            date: { x: 50, y: 70, fontSize: 20, color: "#666666" },
          }
        }),
      });

      if (res.ok) {
        router.push("/admin/templates");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/templates" className="p-2 hover:bg-slate-800 rounded-full transition-all text-slate-400">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold text-white">New Template</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Template Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Webinar Standard 2026"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Background Image (PNG/JPG)</label>
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                preview ? "border-blue-500 bg-blue-500/10" : "border-slate-700 hover:border-slate-500 bg-slate-800/50"
              }`}
            >
              {preview ? (
                <div className="space-y-4">
                  <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded shadow-lg" />
                  <button 
                    type="button" 
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="text-red-400 text-sm hover:underline"
                  >
                    Remove and choose another
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer space-y-4 block">
                  <Upload className="w-12 h-12 text-slate-500 mx-auto" />
                  <div className="text-slate-400">
                    <span className="text-blue-500 font-semibold">Click to upload</span> or drag and drop
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/admin/templates" className="px-6 py-3 text-slate-400 hover:text-white transition-all">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !file || !name}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <Save className="w-5 h-5" />
            {loading ? "Creating..." : "Save Template"}
          </button>
        </div>
      </form>
    </div>
  );
}
