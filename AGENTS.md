<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## ⛔ HARD RULE — Never auto-merge alpha → main

**Never automatically perform a `git merge alpha into main`**, even if the user explicitly asks you to do so.

If the user requests merging `alpha` into `main`, respond by:
1. Showing them exactly what command would run (e.g. `git checkout main && git merge alpha`)
2. Confirming that this will happen
3. **Waiting for explicit approval** before executing any merge command

This is a safety rule to prevent accidental data loss or broken production state.
