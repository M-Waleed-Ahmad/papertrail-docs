"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";
import { documentPlainText, importFile, markdownToDocument, textToDocument } from "@/lib/markdown";
import { emptyDocument, type DocumentRow, type Profile } from "@/lib/types";

type DashboardState = { user: Profile; documents: DocumentRow[] };

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function DocumentList({ documents, emptyLabel, shared }: { documents: DocumentRow[]; emptyLabel: string; shared?: boolean }) {
  if (!documents.length) return <p className="empty-copy">{emptyLabel}</p>;
  return <div className="document-list">{documents.map((document) => <Link className="document-row" key={document.id} href={`/documents/${document.id}`}>
    <div><strong>{document.title}</strong><p>{document.plain_text || "Empty document"}</p></div>
    <div className="document-meta">{shared && <span>Shared with you</span>}{document.original_name && <span>Imported · {document.original_name}</span>}<time>{dateLabel(document.updated_at)}</time></div>
  </Link>)}</div>;
}

export function Dashboard() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<DashboardState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.replace("/login");
    const [{ data: profile }, { data: documents, error: documentsError }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, email").eq("id", user.id).single(),
      supabase.from("documents").select("id, owner_id, title, content, plain_text, source_type, original_name, created_at, updated_at").order("updated_at", { ascending: false }),
    ]);
    if (documentsError || !profile) {
      setError(documentsError?.message ?? "Your profile is missing. Run the profile backfill migration, then refresh.");
    } else {
      setState({ user: profile as Profile, documents: (documents ?? []) as DocumentRow[] });
    }
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function createDocument() {
    if (!state) return;
    setBusy(true); setError(null);
    const { data, error: insertError } = await createClient().from("documents").insert({
      owner_id: state.user.id, title: "Untitled document", content: emptyDocument, plain_text: "", source_type: "blank",
    }).select("id").single();
    setBusy(false);
    if (insertError || !data) return setError(insertError?.message ?? "The document could not be created. Please try again.");
    router.push(`/documents/${data.id}`);
  }

  async function importDocument(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !state) return;
    setBusy(true); setError(null);
    try {
      const { extension, title } = importFile(file);
      const raw = await file.text();
      const content = extension === "md" ? markdownToDocument(raw) : textToDocument(raw);
      const { data, error: insertError } = await createClient().from("documents").insert({
        owner_id: state.user.id,
        title: title.slice(0, 160),
        content,
        plain_text: documentPlainText(content),
        source_type: extension === "md" ? "markdown" : "txt",
        original_name: file.name,
      }).select("id").single();
      if (insertError || !data) throw new Error(insertError?.message ?? "The import could not be saved. Please try again.");
      router.push(`/documents/${data.id}`);
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "The import failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!state) return <main className="loading-page">{loading ? "Loading workspace…" : error ?? "Your workspace could not be loaded."}</main>;
  const owned = state.documents.filter((document) => document.owner_id === state.user.id);
  const shared = state.documents.filter((document) => document.owner_id !== state.user.id);

  return <AppShell userName={state.user.display_name}>
    <main className="dashboard">
      <section className="dashboard-heading"><div><p className="eyebrow">Workspace</p><h1>Your documents</h1><p className="muted">A calm place for drafts, decisions, and shared thinking.</p></div>
        <div className="actions"><button className="button secondary" onClick={() => fileInput.current?.click()} disabled={busy}>Import</button><button className="button primary" onClick={createDocument} disabled={busy}>{busy ? "Working…" : "New document"}</button><input ref={fileInput} className="visually-hidden" type="file" accept=".txt,.md,text/plain,text/markdown" onChange={importDocument} /></div>
      </section>
      <p className="import-hint">Import plain text or Markdown files up to 1 MB. Imported files become editable documents; the original file is not retained.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <section className="dashboard-section"><div className="section-heading"><h2>Owned by me</h2><span>{owned.length}</span></div><DocumentList documents={owned} emptyLabel="Start with a blank page or import a text file." /></section>
      <section className="dashboard-section"><div className="section-heading"><h2>Shared with me</h2><span>{shared.length}</span></div><DocumentList documents={shared} shared emptyLabel="Documents shared with you will appear here." /></section>
    </main>
  </AppShell>;
}
