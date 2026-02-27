// src/app/page.tsx
import { redirect } from "next/navigation";

// Root route redirects to the demo event
// In production, users arrive via their unique link: /e/[eventSlug]?t=[token]
export default function RootPage() {
  redirect("/e/workshop-evaluacion-360");
}
