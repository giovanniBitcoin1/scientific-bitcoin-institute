import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

/**
 * Reads the JSON file written daily by the newhedge.io GitHub Actions workflow
 * at /data/btc-price.json and renders a log-scale price chart.
 *
 * Expected JSON shape:
 *   {
 *     "lastUpdated": "2026-04-19T06:00:00Z",
 *     "series": [
 *       { "date": "2009-01-03", "price": 0.001 },
 *       { "date": "2026-04-18", "price": 68420.12 },
 *       ...
 *     ]
 *   }
 */
export default function BitcoinPriceChart() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/data/btc-price.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])

  if (error) {
    return (
      <div className="p-8 text-center text-slate-500 font-sans text-sm">
        Chart data unavailable &mdash; check back shortly.
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-400 font-sans text-sm animate-pulse">
        Loading chart&hellip;
      </div>
    )
  }

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-2 font-serif">Bitcoin Price &mdash; Live</h2>
          <p className="text-sm text-slate-500 font-sans">
            Updated daily &middot; Last refresh:{' '}
            {data.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString() : 'unknown'}
          </p>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis scale="log" domain={['auto', 'auto']} stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
                formatter={(value) => [`$${Number(value).toLocaleString()}`, 'BTC']}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#f7931a"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
