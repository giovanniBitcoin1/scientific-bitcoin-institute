# Public data series

Files on this branch are written by `scripts/data/collect.mjs` (on `main`),
run every hour by the "Data collector" workflow. The branch holds a single
commit that is replaced at every run: link to the files, do not fork history.

```
https://raw.githubusercontent.com/<owner>/<repo>/data/<file>
```

| File | What it holds |
|---|---|
| `btc-daily.json` | Bitcoin daily open, high, low, close in USD (UTC days), each row with its source and, where available, a second source's close |
| `btc-hourly.json` | Bitcoin hourly closes in USD, last 60 days |
| `fear-greed.json` | Crypto Fear & Greed Index, daily |
| `wiki-pageviews.json` | Daily views of the English Wikipedia article "Bitcoin" |
| `news-volume.json` | Daily share of worldwide online news mentioning "bitcoin" |
| `mining.json` | Difficulty adjustments and daily network hash rate |
| `network-activity.json` | Daily transaction count; mempool size and median fee rate at each collection |
| `status.json` | For each series: whether the last run succeeded, when it last updated, the error if any |

## Reading a file

Every file is one JSON object: `series`, `description`, `generated_at` (UTC),
`sources` (name, URL, licence text and the attribution to show), then one or
more tables of rows, sorted by date, one row per line.

- Days and hours are UTC. Only complete days and hours are published.
- A row older than three days is never rewritten.
- `btc-daily.json`: `source` names where the candle comes from. `check_source`
  and `check_close` give a second source's close for the same day, and
  `check_diff_pct` the difference. Above 1.5% the row carries
  `"flag": "close-differs"`: both values are there, and choosing is up to you.
- When a source is down its file is left as it was; look at `status.json`.

## Using the data

Each file repeats the terms of its sources under `sources`. Show the
attribution given there wherever you display the data. Some sources state no
open licence: check their terms before you redistribute.

## Running it yourself

```
node scripts/data/collect.mjs --out some-folder            # all series
node scripts/data/collect.mjs --out some-folder --only mining
node scripts/data/collect.mjs --self-test                  # no network
```

Node 20 or later, no dependencies. Point `--out` at a folder that already
holds the files to update them incrementally.
