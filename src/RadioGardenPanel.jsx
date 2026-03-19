import { useState, useRef, useCallback } from 'react'

const COUNTRIES = [
  { code: '', label: '🌍 Wszystkie kraje' },
  { code: 'PL', label: '🇵🇱 Polska' },
  { code: 'US', label: '🇺🇸 USA' },
  { code: 'GB', label: '🇬🇧 UK' },
  { code: 'DE', label: '🇩🇪 Niemcy' },
  { code: 'FR', label: '🇫🇷 Francja' },
  { code: 'ES', label: '🇪🇸 Hiszpania' },
  { code: 'IT', label: '🇮🇹 Włochy' },
  { code: 'NL', label: '🇳🇱 Holandia' },
  { code: 'BR', label: '🇧🇷 Brazylia' },
  { code: 'JP', label: '🇯🇵 Japonia' },
  { code: 'AU', label: '🇦🇺 Australia' },
  { code: 'CA', label: '🇨🇦 Kanada' },
  { code: 'RU', label: '🇷🇺 Rosja' },
  { code: 'UA', label: '🇺🇦 Ukraina' },
  { code: 'SE', label: '🇸🇪 Szwecja' },
  { code: 'NO', label: '🇳🇴 Norwegia' },
  { code: 'DK', label: '🇩🇰 Dania' },
  { code: 'FI', label: '🇫🇮 Finlandia' },
  { code: 'TR', label: '🇹🇷 Turcja' },
  { code: 'IN', label: '🇮🇳 Indie' },
  { code: 'MX', label: '🇲🇽 Meksyk' },
  { code: 'AR', label: '🇦🇷 Argentyna' },
  { code: 'ZA', label: '🇿🇦 RPA' },
  { code: 'NG', label: '🇳🇬 Nigeria' },
]

function flagEmoji(code) {
  if (!code || code.length !== 2) return '📻'
  return code.toUpperCase().split('').map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('')
}

export default function RadioGardenPanel({ onSelectStation, onClose }) {
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingId, setLoadingId] = useState(null)
  const [error, setError] = useState('')
  const debounceRef = useRef(null)

  const search = useCallback(async (q, cc) => {
    const term = (cc ? q + ' ' + cc : q).trim()
    if (!term) { setResults([]); return }
    setLoading(true)
    setError('')
    try {
      const raw = await window.playerBridge?.radioGardenSearch(q)
      let list = raw || []
      if (cc) list = list.filter(s => s.countryCode === cc)
      setResults(list)
      if (list.length === 0) setError('Brak wyników')
    } catch {
      setError('Błąd wyszukiwania')
    } finally {
      setLoading(false)
    }
  }, [])

  function handleInput(e) {
    const q = e.target.value
    setQuery(q)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(q, country), 400)
  }

  function handleCountry(e) {
    const cc = e.target.value
    setCountry(cc)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query, cc), 100)
  }

  async function handlePick(station) {
    setLoadingId(station.id)
    try {
      const streamUrl = await window.playerBridge?.radioGardenStream(station.id)
      if (!streamUrl) { setError(`Nie udało się pobrać streamu dla "${station.title}"`); return }
      onSelectStation({
        id: streamUrl,
        name: station.title,
        url: streamUrl,
        country: station.country,
        countryCode: station.countryCode,
        favicon: '',
        tags: '',
        codec: 'MP3',
        bitrate: 128,
        lastSong: '',
        streamCandidates: [streamUrl],
      })
    } catch {
      setError('Błąd połączenia')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="rg-overlay" onClick={onClose}>
      <div className="rg-panel" onClick={e => e.stopPropagation()}>
        <div className="rg-header">
          <span className="rg-title">🌍 Radio Garden</span>
          <button className="rg-close" onClick={onClose}>✕</button>
        </div>
        <div className="rg-filters">
          <input
            className="rg-input"
            placeholder="Szukaj stacji..."
            value={query}
            onChange={handleInput}
            autoFocus
          />
          <select className="rg-select" value={country} onChange={handleCountry}>
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
        </div>
        <div className="rg-results">
          {loading && <div className="rg-status">Szukam...</div>}
          {!loading && error && <div className="rg-status rg-error">{error}</div>}
          {!loading && !error && results.length === 0 && query && <div className="rg-status">Brak wyników</div>}
          {!loading && results.length === 0 && !query && (
            <div className="rg-status rg-hint">Wpisz nazwę stacji lub miasto</div>
          )}
          {results.map(s => (
            <button
              key={s.id}
              className="rg-item"
              onClick={() => handlePick(s)}
              disabled={loadingId === s.id}
            >
              <span className="rg-flag">{flagEmoji(s.countryCode)}</span>
              <span className="rg-item-info">
                <span className="rg-item-name">{s.title}</span>
                <span className="rg-item-sub">{s.subtitle}</span>
              </span>
              {loadingId === s.id && <span className="rg-spinner">⟳</span>}
            </button>
          ))}
        </div>
        <div className="rg-footer">Źródło: radio.garden</div>
      </div>
    </div>
  )
}
