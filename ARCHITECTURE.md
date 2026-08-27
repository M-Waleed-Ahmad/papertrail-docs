# Architecture

## Overview

Papertrail is a Next.js application deployed on Vercel. Supabase provides authentication, Postgres persistence, and Row Level Security. There is no separate API service: the browser uses Supabase’s authenticated client, and database rules enforce access.

```text
Next.js on Vercel
  ├─ Dashboard, import, editor, and sharing interface
  ├─ Cookie-backed Supabase session refresh
  └─ TipTap editor state
          ↓
Supabase
  ├─ Auth
  ├─ Postgres
  └─ Row Level Security
```

## Data model

`profiles` mirrors each authenticated user with a display name and email.

`documents` stores the title, owner, structured TipTap JSON, a small plain-text preview, import source metadata, and timestamps. Rich-text JSON preserves formatting across reloads without relying on raw HTML.

`document_members` records shared collaborators.

## Authorization

Row Level Security controls every exposed table.

- Owners can create, read, edit, delete, and manage membership for their documents.
- Shared editors can read and edit documents shared with them.
- Unshared users cannot select or update a document.
- Only owners can insert or delete sharing records.
- A trigger prevents anyone, including an editor, from changing a document owner.

Document creation and imports use a narrowly scoped database function. It requires an authenticated session, derives ownership from `auth.uid()` rather than browser input, and validates the title and source type. Reads, updates, deletes, and sharing remain governed by RLS.

## Import flow

The dashboard accepts `.txt` and `.md` files up to 1 MB. The browser validates the file, reads it once, converts content into TipTap JSON, and invokes the authenticated creation function. The original binary is deliberately discarded after conversion.

The first version supports headings, bold, italic, ordered lists, and bullet lists from Markdown. Unsupported Markdown is retained as plain text where possible.

## Tradeoffs

Vercel and Supabase keep deployment simple while providing genuine multi-user separation. Prepared accounts keep sharing reviewable without building a full invitation system.

TipTap was selected for a usable editing baseline. Features that require a collaboration server—live cursors, operational transforms, comments, and version history—are intentionally excluded to protect the primary create → import → edit → share flow.
