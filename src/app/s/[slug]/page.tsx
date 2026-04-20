import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SessionLanding from "./SessionLanding";

export default async function PublicSessionPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const session = await prisma.session.findUnique({
    where: { slug: slug, active: true },
    include: {
      template: true,
      signer: true,
    }
  });

  if (!session) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <SessionLanding session={session} />
    </div>
  );
}
