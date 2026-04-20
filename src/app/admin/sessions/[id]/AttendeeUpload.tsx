"use client";

import { useState } from "react";
import { Upload, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AttendeeUpload({ sessionId }: { sessionId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setSuccess(false);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const rows = text.split("\n").slice(1); // Skip header
      
      const attendees = rows
        .map(row => {
          const [email, name] = row.split(",").map(c => c?.trim());
          if (!email) return null;
          return { email, name };
        })
        .filter(Boolean);

      try {
        const res = await fetch(`/api/admin/sessions/${sessionId}/attendees`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attendees }),
        });

        if (res.ok) {
          setSuccess(true);
          router.refresh();
        }
      } catch (err) {
        alert("Failed to upload attendees");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <label className={`
        border-2 border-dashed rounded-xl p-6 text-center cursor-pointer block transition-all
        ${loading ? "opacity-50 pointer-events-none" : "hover:border-blue-500 hover:bg-blue-500/5 border-slate-700"}
      `}>
        {loading ? (
          <div className="animate-pulse text-blue-500">Processing CSV...</div>
        ) : success ? (
          <div className="text-green-500 flex flex-col items-center gap-2">
            <Check className="w-8 h-8" />
            <span>Uploaded successfully!</span>
          </div>
        ) : (
          <div className="space-y-2 text-slate-400">
            <Upload className="w-8 h-8 mx-auto opacity-50" />
            <div className="text-sm">Click to select CSV file</div>
          </div>
        )}
        <input type="file" accept=".csv" className="hidden" onChange={handleUpload} disabled={loading} />
      </label>
      
      {success && (
        <button 
          onClick={() => setSuccess(false)}
          className="text-xs text-blue-500 hover:underline w-full text-center"
        >
          Upload more
        </button>
      )}
    </div>
  );
}
