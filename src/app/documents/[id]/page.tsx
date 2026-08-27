import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentWorkspace } from "@/components/document-workspace";

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { id } = await params;
  return <DocumentWorkspace documentId={id} />;
}
