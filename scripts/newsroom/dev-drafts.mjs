// `npm run dev:drafts`: the dev server with drafts visible (each marked with a
// DRAFT ribbon). A plain `npm run dev` and every build leave drafts out.
// Written as a Node script so it runs the same on Windows and Linux.
import { createServer } from 'vite'

process.env.NEWSROOM_DRAFTS = '1'
const server = await createServer()
await server.listen()
console.log('\n  Drafts are VISIBLE in this dev server (npm run dev:drafts).\n')
server.printUrls()
server.bindCLIShortcuts({ print: true })
