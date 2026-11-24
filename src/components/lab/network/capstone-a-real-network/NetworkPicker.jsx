import { useState } from 'react'
import { Pill } from '../ui.jsx'
import { EXACT_LIMIT, SAMPLE_SOURCES, MAX_NODES, MAX_LINKS } from './capstone.js'
import { readNetwork } from './loader.js'
import { NET_IDS, selectNetwork, setOwnNetwork } from './store.js'

// The network selector shared by the three panels. With `full` (Panel A) it
// also shows the box and the file button for "your own network"; the other
// panels show the choice only.

const T = {
  en: {
    nets: { airports: 'Airports', karate: 'Karate club', florentine: 'Florentine families', own: 'Your own network' },
    placeholder: '# one link per line: a b   or   a b weight\nalice bob\nbob carol 3\ncarol alice',
    help: 'One link per line, "a b" or "a b weight", separated by spaces, tabs, commas or semicolons; lines starting with # are ignored; names are text. Links from a node to itself are dropped, repeated links are merged and their weights added, and the network is read as undirected. The JSON written by lncli describegraph is accepted too: one link per pair of nodes, the total capacity as its weight.',
    privacy: 'The text or file is read here, in your browser, and is not sent anywhere.',
    limits: `Up to ${EXACT_LIMIT.toLocaleString('en-US')} nodes everything is exact; above that, distances and betweenness come from ${SAMPLE_SOURCES} sampled sources and the cards say so. Nothing is run above ${MAX_NODES.toLocaleString('en-US')} nodes or ${MAX_LINKS.toLocaleString('en-US')} links.`,
    load: 'Read the network',
    file: 'Choose a file',
    ok: (r, e) => `Read: ${e.net.n.toLocaleString('en-US')} nodes and ${e.net.A.length.toLocaleString('en-US')} links${r.lnd ? ' (describegraph)' : ''}; largest component ${e.giant.n.toLocaleString('en-US')} nodes. Dropped: ${r.selfLinks} self-link${r.selfLinks === 1 ? '' : 's'}, ${r.skipped} unreadable line${r.skipped === 1 ? '' : 's'}; ${r.merged} repeated link${r.merged === 1 ? '' : 's'} merged.`,
    errors: {
      empty: 'No link found: write at least one line with two names.',
      format: 'This JSON is not the output of describegraph (it needs "edges" with node1_pub, node2_pub and capacity).',
      nodes: `More than ${MAX_NODES.toLocaleString('en-US')} nodes: nothing is run on a network this large.`,
      links: `More than ${MAX_LINKS.toLocaleString('en-US')} links: nothing is run on a network this large.`,
    },
    none: 'No network read yet: paste one in the box of the workbench above.',
    aria: 'Your network, one link per line',
  },
  it: {
    nets: { airports: 'Aeroporti', karate: 'Club di karate', florentine: 'Famiglie fiorentine', own: 'La tua rete' },
    placeholder: '# un collegamento per riga: a b   oppure   a b peso\nanna bruno\nbruno carla 3\ncarla anna',
    help: 'Un collegamento per riga, «a b» oppure «a b peso», separati da spazi, tabulazioni, virgole o punti e virgola; le righe che iniziano con # sono ignorate; i nomi sono testo. I collegamenti da un nodo a sé stesso sono scartati, quelli ripetuti sono uniti sommando i pesi, e la rete è letta come non orientata. È accettato anche il JSON scritto da lncli describegraph: un collegamento per coppia di nodi, con la capacità totale come peso.',
    privacy: 'Il testo o il file è letto qui, nel tuo browser, e non viene inviato da nessuna parte.',
    limits: `Fino a ${EXACT_LIMIT.toLocaleString('it-IT')} nodi tutto è esatto; oltre, distanze e betweenness vengono da ${SAMPLE_SOURCES} sorgenti campionate e le schede lo dicono. Nulla viene eseguito sopra ${MAX_NODES.toLocaleString('it-IT')} nodi o ${MAX_LINKS.toLocaleString('it-IT')} collegamenti.`,
    load: 'Leggi la rete',
    file: 'Scegli un file',
    ok: (r, e) => `Letta: ${e.net.n.toLocaleString('it-IT')} nodi e ${e.net.A.length.toLocaleString('it-IT')} collegamenti${r.lnd ? ' (describegraph)' : ''}; componente più grande ${e.giant.n.toLocaleString('it-IT')} nodi. Scartati: ${r.selfLinks} collegament${r.selfLinks === 1 ? 'o' : 'i'} da un nodo a sé stesso, ${r.skipped} rig${r.skipped === 1 ? 'a illeggibile' : 'he illeggibili'}; ${r.merged} collegament${r.merged === 1 ? 'o ripetuto unito' : 'i ripetuti uniti'}.`,
    errors: {
      empty: 'Nessun collegamento trovato: scrivi almeno una riga con due nomi.',
      format: 'Questo JSON non è l\'output di describegraph (servono gli «edges» con node1_pub, node2_pub e capacity).',
      nodes: `Più di ${MAX_NODES.toLocaleString('it-IT')} nodi: nulla viene eseguito su una rete così grande.`,
      links: `Più di ${MAX_LINKS.toLocaleString('it-IT')} collegamenti: nulla viene eseguito su una rete così grande.`,
    },
    none: 'Nessuna rete letta: incollane una nel riquadro del banco di lavoro qui sopra.',
    aria: 'La tua rete, un collegamento per riga',
  },
}

export default function NetworkPicker({ lang = 'en', active, full = false }) {
  const t = T[lang] || T.en
  const [text, setText] = useState('')
  const [error, setError] = useState(null)
  const read = (source) => {
    const result = readNetwork(source)
    if (result.ok) {
      setError(null)
      setOwnNetwork(result)
    } else setError(result.error)
  }
  const onFile = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => read(String(reader.result))
    reader.readAsText(file)
    e.target.value = ''
  }
  return (
    <div data-picker={full ? 'full' : 'short'} data-net={active.id} data-nodes={active.giant ? active.giant.n : 0}>
      <div className="flex flex-wrap gap-2">
        {NET_IDS.map((id) => (
          <Pill key={id} active={active.id === id} onClick={() => selectNetwork(id)} data-net={id}>
            {t.nets[id]}
          </Pill>
        ))}
      </div>
      {active.id === 'own' && !full && !active.giant && <p className="mt-2 text-sm text-slate-600">{t.none}</p>}
      {active.id === 'own' && full && (
        <div className="mt-3 max-w-2xl">
          <textarea
            data-own="text"
            aria-label={t.aria}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.placeholder}
            rows={5}
            spellCheck={false}
            className="w-full rounded border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-800"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Pill primary onClick={() => read(text)} data-action="load">
              {t.load}
            </Pill>
            <label className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-mono uppercase tracking-wider text-slate-600 hover:text-orange-600 hover:border-orange-300 cursor-pointer">
              {t.file}
              <input type="file" accept=".txt,.csv,.tsv,.json,text/plain,application/json" onChange={onFile} className="sr-only" data-own="file" />
            </label>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-700" data-own="error" data-error={error}>
              {t.errors[error]}
            </p>
          )}
          {!error && active.giant && (
            <p className="mt-2 text-sm text-slate-700" data-own="report" data-nodes={active.net.n} data-links={active.net.A.length} data-self={active.report.selfLinks} data-merged={active.report.merged} data-skipped={active.report.skipped}>
              {t.ok(active.report, active)}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-500 leading-snug">{t.help}</p>
          <p className="mt-1 text-xs text-slate-500 leading-snug">{t.limits}</p>
          <p className="mt-1 text-xs text-slate-700 leading-snug font-medium">{t.privacy}</p>
        </div>
      )}
    </div>
  )
}
