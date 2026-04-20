import { prisma } from "@/lib/prisma";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import SessionForm from "./SessionForm";

export default async function NewSessionPage() {
  const templates = await prisma.diplomaTemplate.findMany();
  const signers = await prisma.signer.findMany();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/sessions" className="p-2 hover:bg-slate-800 rounded-full transition-all text-slate-400">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold text-white">Create New Session</h1>
      </div>

      <SessionForm templates={templates} signers={signers} />
    </div>
  );
}
