# Architecture

## Overview

Papertrail is one Next.js application deployed on Vercel. Supabase provides authentication, Postgres persistence, and Row Level Security. There is no separate API service: browser interactions use Supabase’s authenticated client and all access is enforced by database policies.

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

`profiles` mirrors the authenticated user with a display name and email. A trigger creates the profile when a Supabase Auth user is created.

`documents` stores the title, owner, structured TipTap JSON, a small plain-text preview, import source metadata, and timestamps. Rich-text JSON preserves formatting across reloads without relying on raw HTML.

`document_members` records document editors. Its composite primary key prevents duplicate access records.

## Authorization

The migration enables RLS on every exposed table, revokes broad default privileges, and grants only the needed authenticated operations.

- Owners can create, read, edit, delete, and manage membership for their documents.
- Shared editors can read and edit documents shared with them.
- Unshared users cannot select or update a document.
- Only owners can insert or delete sharing records.
- A trigger prevents anyone, including an editor, from changing a document owner.

Private `security definer` helpers avoid recursive RLS evaluation while retaining the authenticated caller’s identity through `auth.uid()`.

## Import flow

The dashboard accepts `.txt` and `.md` files up to 1 MB. The browser validates the file, reads it once, converts content into TipTap JSON, and inserts a new document using the signed-in user’s RLS-restricted Supabase session. The original binary is deliberately discarded after conversion.

The first version supports headings, bold, italic, ordered lists, and bullet lists from Markdown. Unsupported Markdown is retained as plain text where possible.

## Tradeoffs

Vercel and Supabase keep the deployment path short and production-shaped. Supabase Auth and RLS provide genuine multi-user separation, but a full invitation system would be disproportionate for the assignment, so prepared reviewer accounts are used.

TipTap was selected for a usable editing baseline. Features that require a collaboration server—live cursors, operational transforms, comments, and version history—are intentionally excluded to protect the primary create → import → edit → share flow.
