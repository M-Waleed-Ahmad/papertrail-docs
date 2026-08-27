# Papertrail

Papertrail is a lightweight collaborative document editor built for the Ajaia AI-Native Full Stack Developer assignment. It supports rich-text editing, text and Markdown import, persistent documents, and sharing.

**Live app:** [papertrail-docs.vercel.app](https://papertrail-docs.vercel.app)  
**Source:** [github.com/M-Waleed-Ahmad/papertrail-docs](https://github.com/M-Waleed-Ahmad/papertrail-docs)

## Features

- Create, rename, edit, save, and reopen documents
- Rich-text formatting: bold, italic, underline, headings, bullet lists, numbered lists, undo, and redo
- Import `.txt` and `.md` files up to 1 MB as editable documents
- Email/password authentication through Supabase Auth
- Owner and collaborator sharing
- Clear owned/shared document views
- Supabase Postgres persistence and Row Level Security

Imported files become editable documents; the original binary is not retained.

## Local setup

1. Create a Supabase project.
2. Run the Supabase migrations in order: [`0001_initial.sql`](supabase/migrations/0001_initial.sql), [`0002_backfill_profiles.sql`](supabase/migrations/0002_backfill_profiles.sql), and [`0003_create_document_rpc.sql`](supabase/migrations/0003_create_document_rpc.sql). The second is safe when no backfill is needed; the third is the authenticated write path for blank documents and imports.
3. In Supabase Auth, create any test users required for local sharing checks.
4. Copy `.env.example` to `.env.local` and add the project URL and publishable key from Supabase’s Connect dialog.
5. Install dependencies and start the app:

   ```bash
   npm install
   npm run dev
   ```

6. Visit `http://localhost:3000`.

## Running tests

```bash
npm test
```

The included test verifies the product-relevant upload/import flow: common Markdown formatting becomes editable TipTap JSON, plain text becomes editable paragraphs, and unsupported or oversized files are rejected.

## Deployment

The production deployment is live at [papertrail-docs.vercel.app](https://papertrail-docs.vercel.app). Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for Production and Preview deployments.

Reviewer credentials and the walkthrough link are supplied in the submission Drive folder.

## Scope limits

- No public sign-up, password reset, or social authentication
- No `.docx` or PDF import
- No file attachments or permanent original-file storage
- No simultaneous real-time editing or presence
- No comments, suggestions, version history, or export
- No public sharing links, organization accounts, or viewer-only roles

See [ARCHITECTURE.md](ARCHITECTURE.md) for the design rationale and [AI_WORKFLOW.md](AI_WORKFLOW.md) for the AI-native workflow disclosure.
