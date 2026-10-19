// Downloads the daily BTC/USD reference price from Coin Metrics Community Data
// (CC BY-NC 4.0) and writes the static snapshot used by Module 13, Panel A:
// src/data/lab/bitcoin-price.json, [{ date: "YYYY-MM-DD", price }], with the
// price rounded to 5 significant digits, and bitcoin-price.meta.json with the
// source, licence and retrieval date shown under the chart.
//
//   node scripts/lab/fetch-btc-price.mjs
//
// A snapshot refreshed by hand: rerun it to update the data, then commit both files.
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SOURCE = 'Coin Metrics Community Data'
const PAGE = 'https://github.com/coinmetrics/data'
const CSV = 'https://raw.githubusercontent.com/coinmetrics/data/master/csv/btc.csv'
const LICENCE = 'CC BY-NC 4.0'
const LICENCE_URL = 'https://creativecommons.org/licenses/by-nc/4.0/'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const out = resolve(root, 'src/data/lab/bitcoin-price.json')
const outMeta = resolve(root, 'src/data/lab/bitcoin-price.meta.json')

const res = await fetch(CSV)
if (!res.ok) throw new Error(`${CSV}: HTTP ${res.status}`)
const lines = (await res.text()).trim().split(/\r?\n/)
const header = lines[0].split(',')
const iDate = header.indexOf('time')
const iPrice = header.indexOf('PriceUSD')
if (iDate < 0 || iPrice < 0) throw new Error('columns "time" and "PriceUSD" not found')

const rows = []
for (const line of lines.slice(1)) {
  const cells = line.split(',')
  const date = cells[iDate]?.slice(0, 10)
  const price = Number(cells[iPrice])
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !cells[iPrice] || !(price > 0)) continue
  rows.push({ date, price: Number(price.toPrecision(5)) })
}
rows.sort((a, b) => (a.date < b.date ? -1 : 1))
if (rows.length < 1000) throw new Error(`only ${rows.length} rows: refusing to overwrite the snapshot`)

const meta = {
  source: SOURCE,
  url: PAGE,
  licence: LICENCE,
  licence_url: LICENCE_URL,
  retrieved: new Date().toISOString().slice(0, 10),
  first: rows[0].date,
  last: rows[rows.length - 1].date,
}

mkdirSync(dirname(out), { recursive: true })
const json = JSON.stringify(rows)
writeFileSync(out, json + '\n')
writeFileSync(outMeta, JSON.stringify(meta, null, 2) + '\n')
console.log(`wrote ${out}: ${rows.length} rows, ${meta.first} … ${meta.last}, ${json.length + 1} bytes`)
