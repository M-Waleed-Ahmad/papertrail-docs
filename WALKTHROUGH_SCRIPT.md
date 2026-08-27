# Walkthrough script

Target length: 3–5 minutes.

## 0:00–0:25 — Context

“Papertrail is a focused collaborative document editor. I deliberately prioritized the end-to-end workflow of creating or importing a document, editing it, sharing it, and proving that access and formatting persist.”

## 0:25–1:25 — Create and edit

1. Sign in as the owner account.
2. Create a new document and rename it.
3. Apply a heading, bold text, italic text, underline, a bullet list, and a numbered list.
4. Point out the autosave status, refresh, and show that formatting persists.

## 1:25–2:05 — Import

1. Return to the dashboard.
2. Import `samples/product-launch-brief.md`.
3. Show that headings, bold/italic text, and both list types became editable document content.
4. Mention that Papertrail accepts `.txt` and `.md` up to 1 MB; the original file is intentionally discarded after conversion.

## 2:05–3:00 — Share and enforce access

1. Open the imported document as the owner.
2. Share it with the collaborator account.
3. Sign out and sign in as the collaborator.
4. Show the document under “Shared with me,” make an edit, and refresh.
5. Briefly show that an unshared account cannot access the document, or revoke access and show it disappearing.

## 3:00–3:40 — Technical choices and scope

“The app is Next.js on Vercel with Supabase Auth and Postgres. Rich text is stored as TipTap JSON. Row Level Security protects reads, edits, and sharing, while document creation uses a small authenticated database function so the owner is derived from the active session.”

“I intentionally left out realtime cursors, comments, version history, `.docx` import, attachments, and public links to keep the core collaboration flow reliable in the timebox.”

## 3:40–4:10 — AI workflow

“I used Codex to accelerate planning, implementation, testing, and documentation, but used judgment to keep the design restrained and to reject unnecessary infrastructure. I verified the app with automated import tests, a production build, and a live Vercel deployment.”
