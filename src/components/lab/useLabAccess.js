import { useSyncExternalStore } from 'react'
import labConfig from '../../data/lab/config.json'

const KEY = 'sbi_lab_admin'

// Admin preview: a convenience gate, not access control. /lab?admin asks for
// the passphrase; its SHA-256 is compared with adminHash in
// src/data/lab/config.json and, on a match, stored in localStorage, so this
// browser sees the Lab unlocked. Storing the hash rather than a plain flag
// means a new passphrase (a new adminHash) locks every old preview again.
// Storage may be unavailable, so every access is guarded.
const listeners = new Set()

function readFlag() {
  try {
    return !!labConfig.adminHash && window.localStorage.getItem(KEY) === labConfig.adminHash
  } catch {
    return false
  }
}

function writeFlag(value) {
  try {
    if (value) window.localStorage.setItem(KEY, value)
    else window.localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
  listeners.forEach((fn) => fn())
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// Whether this browser sees the Lab unlocked: for everyone when config.json
// says "locked": false, otherwise only in an admin preview.
export function isLabUnlocked() {
  return !labConfig.locked || readFlag()
}

async function sha256Hex(text) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('')
}

// Resolves to true and stores the flag when the passphrase matches.
export async function unlockAdmin(passphrase) {
  if (!labConfig.adminHash || !window.crypto?.subtle) return false
  const hash = await sha256Hex(passphrase)
  if (hash !== labConfig.adminHash) return false
  writeFlag(hash)
  return true
}

export function lockAgain() {
  writeFlag(null)
}

export default function useLabAccess() {
  const admin = useSyncExternalStore(subscribe, readFlag, () => false)
  return { admin, unlocked: !labConfig.locked || admin }
}
