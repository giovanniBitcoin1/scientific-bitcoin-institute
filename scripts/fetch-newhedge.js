#!/usr/bin/env node
/**
 * fetch-newhedge.js
 *
 * Runs daily via .github/workflows/fetch-newhedge-daily.yml.
 * Reads API key from env var NEWHEDGE_API_KEY (stored as a GitHub Actions Secret).
 * Writes JSON output to public/data/ — those files become available at
 * https://scientificbitcoininstitute.org/data/<filename> after the next deploy.
 *
 * ⚠️ PLACEHOLDER ALERT ⚠️
 * The fetch URL, auth header format, and response shape below are BEST GUESSES.
 * Check the real newhedge.io API docs and edit the three marked sections.
 */

import fs from 'node:fs/promises'
import path from 'node:path'

const API_KEY = process.env.NEWHEDGE_API_KEY
if (!API_KEY) {
  console.error('ERROR: NEWHEDGE_API_KEY env var is not set.')
  console.error('For local testing: export NEWHEDGE_API_KEY=your_key_here')
  console.error('In GitHub Actions, add it as a repository secret.')
  process.exit(1)
}

// ─── EDIT THIS SECTION WITH REAL NEWHEDGE ENDPOINT ──────────────────────
const ENDPOINT = 'https://api.newhedge.io/v1/bitcoin/price-history'  // ← PLACEHOLDER
const AUTH_HEADER = { 'Authorization': `Bearer ${API_KEY}` }         // ← PLACEHOLDER (could be 'X-API-Key' instead)
// ────────────────────────────────────────────────────────────────────────

async function fetchPriceHistory() {
  console.log(`Fetching from ${ENDPOINT}...`)
  const res = await fetch(ENDPOINT, { headers: AUTH_HEADER })
  if (!res.ok) {
    throw new Error(`Newhedge API returned ${res.status}: ${await res.text()}`)
  }
  return res.json()
}

// ─── EDIT THIS SECTION TO MATCH NEWHEDGE RESPONSE SHAPE ──────────────────
function transformToSeries(rawApiResponse) {
  // Assumes Newhedge returns something like:
  //   { data: [ { timestamp: "...", usd: 68420.12 }, ... ] }
  // Adjust the mapping to whatever their actual shape is.
  return rawApiResponse.data.map((row) => ({
    date: row.timestamp.slice(0, 10),       // YYYY-MM-DD
    price: row.usd,
  }))
}
// ────────────────────────────────────────────────────────────────────────

async function main() {
  const raw = await fetchPriceHistory()
  const series = transformToSeries(raw)

  const output = {
    lastUpdated: new Date().toISOString(),
    source: 'newhedge.io',
    series,
  }

  const outPath = path.join(process.cwd(), 'public', 'data', 'btc-price.json')
  await fs.mkdir(path.dirname(outPath), { recursive: true })
  await fs.writeFile(outPath, JSON.stringify(output, null, 2))

  console.log(`Wrote ${series.length} data points to ${outPath}`)
}

main().catch((err) => {
  console.error('fetch-newhedge failed:', err)
  process.exit(1)
})
