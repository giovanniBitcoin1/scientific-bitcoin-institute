import { useEffect, useState } from 'react'

const KEY = 'sbi_lab_lang'

// Lab language, default "en", remembered across pages in localStorage.
// Storage may be unavailable (private mode, blocked site data), so every
// access is guarded and the page still works without it.
export default function useLabLang() {
  const [lang, setLang] = useState(() => {
    try {
      const saved = window.localStorage.getItem(KEY)
      return saved === 'it' ? 'it' : 'en'
    } catch {
      return 'en'
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, lang)
    } catch {
      // ignore
    }
  }, [lang])

  return [lang, setLang]
}
