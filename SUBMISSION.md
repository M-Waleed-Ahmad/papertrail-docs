# Papertrail submission

## Included

- Source code for the Next.js application
- `README.md` with local setup, reviewer guidance, and deployment steps
- `ARCHITECTURE.md`
- `AI_WORKFLOW.md`
- Supabase migrations: `supabase/migrations/0001_initial.sql`, `0002_backfill_profiles.sql`, and `0003_create_document_rpc.sql`
- Automated import test: `tests/markdown.test.ts`
- Upload samples: `samples/product-launch-brief.md` and `samples/customer-interview-notes.txt`
- Walkthrough recording outline: `WALKTHROUGH_SCRIPT.md`
- This submission inventory
- `WALKTHROUGH_URL.txt` (public link must be added before final submission)

## Live product

[https://papertrail-docs.vercel.app](https://papertrail-docs.vercel.app)

## Reviewer accounts

| Purpose | Email | Password |
| --- | --- | --- |
| Owner | `owner@papertrail.demo` | See `REVIEWER_CREDENTIALS.md` in the Drive folder |
| Collaborator | `collaborator@papertrail.demo` | See `REVIEWER_CREDENTIALS.md` in the Drive folder |
| Unshared user | `unshared@papertrail.demo` | See `REVIEWER_CREDENTIALS.md` in the Drive folder |

`REVIEWER_CREDENTIALS.md` is deliberately excluded from the public GitHub repository. Create it from `REVIEWER_CREDENTIALS.example.md` and include it in the final Drive folder.

## Working functionality

- Create, rename, edit, autosave, and reopen rich-text documents
- Bold, italic, underline, headings, bullet lists, and numbered lists
- `.txt` and `.md` upload/import into editable documents
- Owner/editor sharing and revocation
- Supabase persistence and database-enforced access control, including session-derived ownership during document creation

## Intentionally incomplete

- `.docx` and PDF imports
- Attachments and permanent original-file storage
- Real-time simultaneous editing
- Comments, suggestions, history, export, public share links, and advanced roles

## Next 2–4 hours

- Add viewer and commenter roles
- Add document search and folders
- Add a collaborative presence indicator
- Add version history and Markdown export

## Final pre-submission checklist

- [x] Source code pushed to GitHub
- [x] Live Vercel deployment
- [x] README, architecture note, AI workflow note, and submission inventory
- [x] Automated test suite and successful production build
- [x] Sample upload files
- [ ] Create the three reviewer accounts and include their credentials in the Drive-only file
- [ ] Complete the production owner → share → collaborator → revoke walkthrough
- [ ] Record the 3–5 minute video and replace the placeholder in `WALKTHROUGH_URL.txt`
- [ ] Add the completed `REVIEWER_CREDENTIALS.md`, `WALKTHROUGH_URL.txt`, and source archive to one Google Drive folder
