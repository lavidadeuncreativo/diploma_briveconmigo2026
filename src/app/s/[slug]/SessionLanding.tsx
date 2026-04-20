"use client";

import { useState } from "react";
import { Download, Share2, Linkedin, Send, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SessionLanding({ session }: { session: any }) {
  const [step, setStep] = useState(1); // 1: Input, 2: Preview
  const [formData, setFormData] = useState({ name: "", email: "", token: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/s/${session.slug}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
        setStep(2);
      } else {
        setError(data.error || "Algo salió mal. Por favor intenta de nuevo.");
      }
    } catch (err) {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const shareWhatsApp = () => {
    const text = `¡Acabo de recibir mi certificado de ${session.title}! Puedes verlo aquí: ${window.location.origin}/verify/${result.certificateId}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 md:py-24 font-[family-name:var(--font-geist-sans)]">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100">
                Brivé Conmigo
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">
                {session.title}
              </h1>
              <p className="text-slate-500 text-lg font-medium">
                Ingresa tus datos para generar y descargar tu diploma de participación.
              </p>
            </div>

            <form onSubmit={handleGenerate} className="bg-white p-10 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Tal como aparecerá en el diploma"
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 font-medium"
                  />
                </div>

                {session.validationMode === "ATTENDEE_LIST" && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Correo con el que te registraste"
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 font-medium"
                    />
                  </div>
                )}

                {session.validationMode === "TOKEN" && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Código de Acceso</label>
                    <input
                      type="text"
                      required
                      value={formData.token}
                      onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                      placeholder="Ingresa tu token único"
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 font-medium"
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm py-4 px-5 rounded-2xl text-center font-bold border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <> Generar Diploma <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> </>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-sm font-bold uppercase border border-green-100">
                <CheckCircle2 className="w-4 h-4" /> ¡Felicidades, {formData.name.split(' ')[0]}!
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900">Tu diploma está listo</h1>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden ring-1 ring-slate-100/50">
               <img src={result.pngUrl} alt="Diploma Preview" className="w-full rounded-2xl shadow-inner border border-slate-50" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <a 
                href={result.pdfUrl} 
                download 
                className="flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
              >
                <Download className="w-5 h-5" /> PDF
              </a>
              <button 
                onClick={shareWhatsApp}
                className="flex items-center justify-center gap-3 bg-[#25D366] text-white py-5 rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl shadow-green-500/20"
              >
                <Share2 className="w-5 h-5" /> WhatsApp
              </button>
            </div>
            
            <button 
              onClick={() => setStep(1)}
              className="w-full text-slate-400 text-sm font-bold hover:text-slate-600 transition-all uppercase tracking-widest"
            >
              Corregir nombre o generar otro
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
