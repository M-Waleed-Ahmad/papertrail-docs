"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { RichTextEditor } from "@/components/rich-text-editor";
import { createClient } from "@/lib/supabase/client";
import { documentPlainText } from "@/lib/markdown";
import { canManageSharing } from "@/lib/permissions";
import type { DocumentMember, DocumentRow, Profile, RichTextDocument } from "@/lib/types";

type WorkspaceState = { user: Profile; document: DocumentRow; owner: Profile; members: DocumentMember[]; profiles: Profile[] };

export function DocumentWorkspace({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [state, setState] = useState<WorkspaceState | null>(null);
  const [title, setTitle] = useState("");
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [error, setError] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function load() {
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return router.replace("/login");
    const { data: document, error: documentError } = await supabase.from("documents")
      .select("id, owner_id, title, content, plain_text, source_type, original_name, created_at, updated_at")
      .eq("id", documentId).single();
    if (documentError || !document) return router.replace("/dashboard");
    const [{ data: user }, { data: owner }, { data: members }, { data: profiles }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, email").eq("id", authUser.id).single(),
      supabase.from("profiles").select("id, display_name, email").eq("id", document.owner_id).single(),
      supabase.from("document_members").select("document_id, user_id, role, created_at").eq("document_id", documentId),
      supabase.from("profiles").select("id, display_name, email").order("display_name"),
    ]);
    if (!user || !owner) return setError("We could not load this document.");
    setTitle(document.title);
    setState({
      user: user as Profile,
      document: document as DocumentRow,
      owner: owner as Profile,
      members: (members ?? []) as DocumentMember[],
      profiles: (profiles ?? []) as Profile[],
    });
  }

  useEffect(() => { void load(); return () => { if (timer.current) clearTimeout(timer.current); }; }, [documentId]);

  function queueContentSave(content: RichTextDocument) {
    if (!state) return;
    if (timer.current) clearTimeout(timer.current);
    setSaveState("saving");
    timer.current = setTimeout(() => void save({ content, plain_text: documentPlainText(content) }), 800);
  }

  async function save(patch: Partial<Pick<DocumentRow, "title" | "content" | "plain_text">>) {
    if (!state) return;
    setSaveState("saving");
    const { data, error: updateError } = await createClient().from("documents").update(patch).eq("id", documentId)
      .select("id, owner_id, title, content, plain_text, source_type, original_name, created_at, updated_at").single();
    if (updateError || !data) {
      setSaveState("error");
      return setError("Your latest changes could not be saved. Please try again.");
    }
    setState((previous) => previous ? { ...previous, document: data as DocumentRow } : previous);
    setSaveState("saved");
  }

  async function saveTitle() {
    const cleaned = title.trim().slice(0, 160);
    if (!cleaned) { setTitle(state?.document.title ?? "Untitled document"); return; }
    if (cleaned !== state?.document.title) await save({ title: cleaned });
  }

  async function addMember() {
    if (!state || !selectedUser) return;
    setError(null);
    const { error: addError } = await createClient().from("document_members").insert({ document_id: documentId, user_id: selectedUser, role: "editor" });
    if (addError) return setError("That person could not be added. They may already have access.");
    setSelectedUser("");
    await load();
  }

  async function removeMember(userId: string) {
    setError(null);
    const { error: removeError } = await createClient().from("document_members").delete().eq("document_id", documentId).eq("user_id", userId);
    if (removeError) return setError("Access could not be removed. Please try again.");
    await load();
  }

  if (!state) return <main className="loading-page">Loading document…</main>;
  const isOwner = state.document.owner_id === state.user.id;
  const canShare = canManageSharing(isOwner);
  const memberIds = new Set(state.members.map((member) => member.user_id));
  const candidates = state.profiles.filter((profile) => profile.id !== state.user.id && !memberIds.has(profile.id));

  return <AppShell userName={state.user.display_name} compact>
    <main className="editor-page">
      <div className="editor-header"><Link className="back-link" href="/dashboard">← All documents</Link><div className="editor-header-actions"><span className={saveState === "error" ? "save-state error" : "save-state"}>{saveState === "saving" ? "Saving…" : saveState === "error" ? "Save failed" : "Saved"}</span>{canShare && <button className="button secondary" onClick={() => setShowShare(true)}>Share</button>}</div></div>
      <section className="document-titlebar"><div><input aria-label="Document title" className="document-title" value={title} maxLength={160} onChange={(event) => setTitle(event.target.value)} onBlur={() => void saveTitle()} /><p className="document-context">{isOwner ? "Owned by you" : `Shared by ${state.owner.display_name}`}{state.document.original_name ? ` · Imported from ${state.document.original_name}` : ""}</p></div></section>
      {error && <p className="form-error editor-error" role="alert">{error}</p>}
      <RichTextEditor initialContent={state.document.content} onChange={queueContentSave} editable />
    </main>
    {showShare && <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowShare(false)}><section className="share-modal" role="dialog" aria-modal="true" aria-labelledby="share-title" onMouseDown={(event) => event.stopPropagation()}>
      <div className="modal-heading"><div><p className="eyebrow">Sharing</p><h2 id="share-title">Manage access</h2></div><button className="icon-button" aria-label="Close" onClick={() => setShowShare(false)}>×</button></div>
      <p className="muted">People you add can edit this document.</p>
      <div className="share-add"><select aria-label="Choose a person" value={selectedUser} onChange={(event) => setSelectedUser(event.target.value)}><option value="">Select a person…</option>{candidates.map((profile) => <option value={profile.id} key={profile.id}>{profile.display_name} · {profile.email}</option>)}</select><button className="button primary" disabled={!selectedUser} onClick={() => void addMember()}>Add</button></div>
      <div className="people-list"><div className="person-row"><div><strong>{state.owner.display_name}</strong><span>{state.owner.email}</span></div><small>Owner</small></div>{state.members.map((member) => {
        const profile = state.profiles.find((item) => item.id === member.user_id);
        return profile ? <div className="person-row" key={member.user_id}><div><strong>{profile.display_name}</strong><span>{profile.email}</span></div><button className="text-button danger" onClick={() => void removeMember(member.user_id)}>Remove</button></div> : null;
      })}</div>
    </section></div>}
  </AppShell>;
}
