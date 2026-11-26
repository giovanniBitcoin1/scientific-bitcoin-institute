// Panel A's inputs: the dated defaults (sources looked up on 26 November
// 2026, details in docs/reports/game-theory-lab-14-log.md; no Coin Metrics
// data) and the round test values of the exercises and the self-check.
// Where no figure could be verified, the value is round and labelled an
// assumption.

export const DATED = {
  price: 60374,
  subsidy: 3.125,
  fees: 0.0201,
  hashrate: 1019,
  hwPrice: 18.28,
  eff: 13.5,
  elec: 0.05,
  n: 12,
  V: 1e9,
  rentShare: 0.0087,
  collapse: false,
  loss: 0.5,
}

export const TEST = {
  price: 65000,
  subsidy: 3.125,
  fees: 0.02,
  hashrate: 1000,
  hwPrice: 15,
  eff: 17,
  elec: 0.05,
  n: 12,
  V: 1e9,
  rentShare: 0.0087,
  collapse: false,
  loss: 0.5,
}

// The source of each dated default, shown under its field.
export const SOURCES = {
  price: {
    en: 'CoinGecko, daily close of 25 November 2026',
    it: 'CoinGecko, chiusura giornaliera del 25 novembre 2026',
  },
  subsidy: {
    en: 'the protocol, since block 840,000 (20 April 2024)',
    it: 'il protocollo, dal blocco 840.000 (20 aprile 2024)',
  },
  fees: {
    en: 'Hashrate Index, average of the week to 23 November 2026',
    it: 'Hashrate Index, media della settimana al 23 novembre 2026',
  },
  hashrate: {
    en: 'Hashrate Index, 30-day average, 23 November 2026',
    it: 'Hashrate Index, media di 30 giorni, 23 novembre 2026',
  },
  hwPrice: {
    en: 'Luxor ASIC price index, machines under 14 J per TH, 24 November 2026 (The Block)',
    it: 'indice dei prezzi ASIC di Luxor, macchine sotto 14 J per TH, 24 novembre 2026 (The Block)',
  },
  eff: {
    en: 'maker’s specification of a current machine (Antminer S21 XP); the network’s average is higher',
    it: 'specifica del produttore di una macchina attuale (Antminer S21 XP); la media della rete è più alta',
  },
  elec: {
    en: 'assumption: a round value (CBECI’s constant global average)',
    it: 'ipotesi: un valore tondo (la media globale costante del CBECI)',
  },
  n: {
    en: 'Budish’s base case: an hour of confirmations and an hour of escrow',
    it: 'il caso base di Budish: un’ora di conferme e un’ora di escrow',
  },
  V: {
    en: 'assumption: the value at stake in the attack',
    it: 'ipotesi: il valore in gioco nell’attacco',
  },
  rentShare: {
    en: 'NiceHash, 8.85 EH/s on sale, 25–26 November 2026, against 1,019 EH/s',
    it: 'NiceHash, 8,85 EH/s in vendita, 25–26 novembre 2026, contro 1.019 EH/s',
  },
  loss: {
    en: 'assumption: the share of the hardware’s value she loses if the attack makes Bitcoin collapse',
    it: 'ipotesi: la quota del valore dell’hardware che perde se l’attacco fa crollare Bitcoin',
  },
}
