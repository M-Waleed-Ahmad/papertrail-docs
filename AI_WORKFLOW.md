# AI workflow note

## Tools used

I used Codex, including the Ponytail minimal-build workflow, as a collaborative implementation assistant for planning, code scaffolding, interface iteration, test ideas, debugging, and documentation structure. I also used official Vercel, Next.js, and Supabase documentation to validate the deployment, local bundler fallback, SSR session, and Row Level Security approach.

## Where AI sped up the work

- Converting the ambiguous assignment brief into a scoped product flow and acceptance checklist.
- Drafting the Supabase schema, then reviewing it for RLS recursion, owner-change edge cases, and an observed production insert-policy failure.
- Producing a first-pass Markdown-to-TipTap converter and focused tests.
- Accelerating UI implementation while retaining a deliberately restrained visual system.

## Output changed or rejected

I rejected the initial temptation to add a separate Python backend, ORM, object storage, realtime infrastructure, generic dashboard cards, gradients, and AI-writing features. None were required to validate the main product slice.

I also changed the authorization approach from interface-only checks to Supabase Row Level Security plus an owner-immutability trigger. After production testing surfaced an insert-policy failure, I replaced browser-supplied ownership during creation with a narrowly scoped authenticated database function. The UI hides owner-only actions, but the database remains the security boundary.

## Verification approach

- Run the Markdown import test suite: 3 passing tests.
- Run a successful production build.
- Confirm the deployed Vercel URL reaches the application login page after production environment configuration.
- Test the full owner → share → collaborator → revoke flow with prepared accounts in production.
- Attempt direct document access while signed in as the unshared account.
- Refresh after rich-text edits and imports to verify structured persistence.
- Check keyboard access for the editor toolbar, login form, file input, and sharing dialog.
- Review the application against the assignment requirements and document all intentional scope cuts.
