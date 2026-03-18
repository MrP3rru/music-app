// Uruchamiany jako osobny proces po zamknięciu Electrona
// Kopiuje pliki z rozpakowanego archiwum do katalogu aplikacji,
// a następnie uruchamia starter.vbs
const fs = require('fs')
const path = require('path')
const cp = require('child_process')

const appDir  = process.argv[2]
const srcDir  = process.argv[3]

if (!appDir || !srcDir) process.exit(1)

const SKIP = new Set(['node_modules', '.git', 'dist', 'release', 'apply-update.cjs'])

function copyDir(src, dest) {
  for (const item of fs.readdirSync(src)) {
    if (SKIP.has(item)) continue
    const s = path.join(src, item)
    const d = path.join(dest, item)
    if (fs.statSync(s).isDirectory()) {
      fs.mkdirSync(d, { recursive: true })
      copyDir(s, d)
    } else {
      try { fs.copyFileSync(s, d) } catch {}
    }
  }
}

// Czekaj aż Electron się zamknie
setTimeout(() => {
  try {
    copyDir(srcDir, appDir)
    fs.writeFileSync(path.join(appDir, 'update-pending'), '')
  } catch {}

  cp.spawn('wscript.exe', [path.join(appDir, 'starter.vbs')], {
    detached: true,
    stdio: 'ignore',
  }).unref()

  process.exit(0)
}, 2500)
