# Papertrail

Papertrail is a focused collaborative document editor built for the Ajaia AI-Native Full Stack Developer assignment. It supports rich-text documents, text and Markdown import, durable persistence, and database-enforced sharing.

**Live app:** [papertrail-docs.vercel.app](https://papertrail-docs.vercel.app)  
**Source:** [github.com/M-Waleed-Ahmad/papertrail-docs](https://github.com/M-Waleed-Ahmad/papertrail-docs)

## Product scope

- Create, rename, edit, save, and reopen documents
- Rich-text formatting: bold, italic, underline, headings, bullet lists, numbered lists, undo, and redo
- Import `.txt` and `.md` files up to 1 MB as editable documents
- Email/password authentication through Supabase Auth
- Owner and editor sharing roles
- Clear owned/shared document views
- Supabase Postgres persistence and Row Level Security

Original imported files are parsed into editable documents and then discarded. Papertrail does not retain file binaries or use object storage.

## Local setup

1. Create a Supabase project.
2. Run the Supabase migrations in order: [`0001_initial.sql`](supabase/migrations/0001_initial.sql), [`0002_backfill_profiles.sql`](supabase/migrations/0002_backfill_profiles.sql), and [`0003_create_document_rpc.sql`](supabase/migrations/0003_create_document_rpc.sql). The second is safe when no backfill is needed; the third is the authenticated write path for blank documents and imports.
3. In Supabase Auth, create the reviewer accounts described below. Confirm their email addresses and set `display_name` in each user’s metadata before creation, for example `{ "display_name": "Maya Chen" }`.
4. Copy `.env.example` to `.env.local` and add the project URL and publishable key from Supabase’s Connect dialog.
5. Install dependencies and start the app:

   ```bash
   npm install
   npm run dev
   ```

6. Visit `http://localhost:3000`.

## Reviewer accounts

Create these accounts before deployment:

| Purpose | Email | Display name |
| --- | --- | --- |
| Owner | `owner@papertrail.demo` | Maya Chen |
| Collaborator | `collaborator@papertrail.demo` | Daniel Brooks |
| Access-control check | `unshared@papertrail.demo` | Avery Singh |

Public sign-up should be disabled for the submission deployment. The reviewer accounts demonstrate the sharing flow without exposing an account-creation surface. Copy `REVIEWER_CREDENTIALS.example.md` to the ignored `REVIEWER_CREDENTIALS.md`, fill in the real passwords, and include it in the Google Drive submission folder—not the public GitHub repository.

## Running tests

```bash
npm test
```

The included test verifies the product-relevant upload/import flow: common Markdown formatting becomes editable TipTap JSON, plain text becomes editable paragraphs, and unsupported or oversized files are rejected.

## Deployment

The production deployment is live at [papertrail-docs.vercel.app](https://papertrail-docs.vercel.app). Vercel requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for Production and Preview deployments.

Before submitting, use `WALKTHROUGH_SCRIPT.md` to record the required 3–5 minute video, paste its public link into `WALKTHROUGH_URL.txt`, and include the completed ignored `REVIEWER_CREDENTIALS.md` in the Drive folder.

## Deliberate scope cuts

- No public sign-up, password reset, or social authentication
- No `.docx` or PDF import
- No file attachments or permanent original-file storage
- No simultaneous real-time editing or presence
- No comments, suggestions, version history, or export
- No public sharing links, organization accounts, or viewer-only roles

See [ARCHITECTURE.md](ARCHITECTURE.md) for the design rationale and [AI_WORKFLOW.md](AI_WORKFLOW.md) for the AI-native workflow disclosure.
