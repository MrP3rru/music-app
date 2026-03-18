export default function VersionPopup({ version, history, onClose }) {
  function formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d)) return dateStr
    return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="vp-overlay" onClick={onClose}>
      <div className="vp-popup" onClick={e => e.stopPropagation()}>
        <div className="vp-header">
          <div className="vp-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2.05V4.08c3.95.49 7 3.85 7 7.92s-3.05 7.43-7 7.92v2.03c5.05-.5 9-4.76 9-9.95S18.05 2.55 13 2.05zM11 2.05c-2.01.2-3.84 1-5.33 2.21L7.08 5.7c1.12-.86 2.44-1.44 3.92-1.64V2.05zM5.7 7.08 4.26 5.64C3.05 7.13 2.25 8.96 2.05 11H4.08c.2-1.48.78-2.8 1.62-3.92zM4.08 13H2.05c.2 2.04 1 3.87 2.21 5.36l1.43-1.43C4.86 15.8 4.28 14.48 4.08 13zm1.63 7.37C7.12 21.8 8.95 22.6 11 22.8v-2.03c-1.48-.2-2.8-.78-3.91-1.63l-1.38 1.23z"/></svg>
            Historia wersji
          </div>
          <button className="vp-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>

        <div className="vp-list">
          {(history || []).length === 0 && (
            <p className="vp-empty">Brak historii wersji</p>
          )}
          {(history || []).map((entry, i) => (
            <div key={entry.version} className={`vp-entry${i === 0 ? ' vp-entry-latest' : ''}`}>
              <div className="vp-entry-header">
                <span className="vp-entry-version">
                  v{entry.version}
                  {i === 0 && <span className="vp-latest-badge">aktualna</span>}
                </span>
                <span className="vp-entry-date">{formatDate(entry.date)}</span>
              </div>
              {entry.changes && entry.changes.length > 0 && (
                <ul className="vp-changes">
                  {entry.changes.map((c, j) => (
                    <li key={j}>{c}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
