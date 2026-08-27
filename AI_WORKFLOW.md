# AI workflow note

## Tools used

I used Codex and the Ponytail minimal-build workflow for planning, implementation, debugging, testing ideas, and documentation. I used official Vercel, Next.js, and Supabase documentation to validate deployment and authentication decisions.

## Where AI helped

- Turned the brief into a focused create → import → edit → share workflow.
- Accelerated the first pass of the schema, Markdown importer, interface, and automated test.
- Helped investigate and correct an observed document-creation permission failure.

## Judgment applied

I rejected a separate backend, ORM, object storage, real-time infrastructure, and AI-writing features. They were not necessary for the assignment’s main product slice.

I kept access control in Supabase Row Level Security rather than relying only on interface checks. Document ownership is derived from the authenticated session, not supplied by the browser.

## Verification

- Ran the import test suite and a production build.
- Confirmed the Vercel deployment reaches the application.
- Verified persistence by saving and reopening documents.
- Tested the owner → share → collaborator → revoke flow and the unshared-user access boundary.
