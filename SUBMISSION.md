# Papertrail — Submission

## Links

- **Live product:** [papertrail-docs.vercel.app](https://papertrail-docs.vercel.app)
- **Source code:** [github.com/M-Waleed-Ahmad/papertrail-docs](https://github.com/M-Waleed-Ahmad/papertrail-docs)
- **Walkthrough video:** see `WALKTHROUGH_URL.txt`

## Included

- Full Next.js application source, Supabase migrations, and sample import files
- `README.md` with local setup, deployment configuration, and test instructions
- `ARCHITECTURE.md` with the technical approach and tradeoffs
- `AI_WORKFLOW.md` with the AI-native workflow disclosure
- `tests/markdown.test.ts`, a focused automated test for the import flow
- `WALKTHROUGH_URL.txt` with the public video link

## What works

- Create, rename, edit, save, and reopen rich-text documents
- Format documents with bold, italic, underline, headings, and ordered or unordered lists
- Import `.txt` and `.md` files (up to 1 MB) as editable documents
- Share a document with another prepared user, distinguish owned from shared documents, and revoke access
- Persist documents and sharing data in Supabase Postgres with Row Level Security

## Reviewer access

Use the owner and collaborator credentials provided separately in the submission Drive folder. The owner account demonstrates document creation and sharing; the collaborator account demonstrates shared access and editing. An unshared account is included for the access-control check.

## Intentionally out of scope

- `.docx` and PDF import, attachments, and original-file storage
- Real-time co-editing, comments, suggestions, version history, and export
- Public links, organization accounts, and advanced roles

## With another 2–4 hours

I would add viewer/commenter roles, document search and folders, then version history or collaborative presence.
