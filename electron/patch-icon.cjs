/**
 * patch-icon.cjs
 * Podmienia ikonę + metadane w electron.exe (patch in-place).
 * Uruchamiany przez starter.bat przed npm run dev:desktop.
 */
const path  = require('path')
const fs    = require('fs')
const { NtExecutable, NtExecutableResource, Data, Resource } = require('resedit')

const icoPath = path.join(__dirname, 'appicon.ico')
const exePath = require('electron')                  // .../dist/electron.exe
const bakPath = exePath + '.original'                // backup czystego exe

if (!fs.existsSync(icoPath)) {
  console.log('[patch-icon] Brak appicon.ico — pomijam.')
  process.exit(0)
}

// Backup tworzymy tylko raz — zawsze patchujemy z oryginału
if (!fs.existsSync(bakPath)) {
  fs.copyFileSync(exePath, bakPath)
  console.log('[patch-icon] Backup electron.exe.original utworzony.')
}

try {
  const exe = NtExecutable.from(fs.readFileSync(bakPath))
  const res = NtExecutableResource.from(exe)

  // ── 1. Ikona ──────────────────────────────────────────────────────────
  const ico = Data.IconFile.from(fs.readFileSync(icoPath))
  Resource.IconGroupEntry.replaceIconsForResource(
    res.entries, [1], 1033,
    ico.icons.map(i => i.data)
  )

  // ── 2. Metadane wersji ────────────────────────────────────────────────
  const vis = Resource.VersionInfo.fromEntries(res.entries)
  if (vis.length > 0) {
    const vi = vis[0]
    for (const lang of vi.getAllLanguagesForStringValues()) {
      vi.setStringValues(lang, {
        FileDescription:  'Music App',
        ProductName:      'Music App',
        InternalName:     'music-app',
        OriginalFilename: 'electron.exe',
        CompanyName:      'byPerru',
      })
    }
    vi.outputToResourceEntries(res.entries)
  }

  res.outputResource(exe)
  fs.writeFileSync(exePath, Buffer.from(exe.generate()))
  console.log('[patch-icon] electron.exe zaktualizowany (ikona + metadane) ✓')

} catch (e) {
  console.warn('[patch-icon] Błąd:', e.message)
}
