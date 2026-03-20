let ctx = null
let uiVolumeScale = 0.35 // domyślnie 35% — zsynchronizowane z App.jsx

export function setUiVolume(percent) {
  uiVolumeScale = Math.max(0, Math.min(1, percent / 100))
}

function getCtx() {
  // @ts-ignore
  const AC = window.AudioContext || window.webkitAudioContext
  if (!ctx || ctx.state === 'closed') ctx = new AC()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function note({ freq, type = 'sine', start = 0, duration = 0.2, vol = 0.15, attack = 0.008, release = 0.12 }) {
  try {
    const ac = getCtx()
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.type = type
    osc.frequency.value = freq
    const t = ac.currentTime + start
    const v = vol * uiVolumeScale
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(v, t + attack)
    gain.gain.setValueAtTime(v, t + duration - release)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
    osc.start(t)
    osc.stop(t + duration + 0.05)
  } catch {}
}

function glide({ freqFrom, freqTo, type = 'sine', start = 0, duration = 0.22, vol = 0.12, attack = 0.01 }) {
  try {
    const ac = getCtx()
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freqFrom, ac.currentTime + start)
    osc.frequency.exponentialRampToValueAtTime(freqTo, ac.currentTime + start + duration)
    const t = ac.currentTime + start
    const v = vol * uiVolumeScale
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(v, t + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
    osc.start(t)
    osc.stop(t + duration + 0.05)
  } catch {}
}

// Losowy wybór wariantu
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

// Małe losowe odchylenie częstotliwości — każde wywołanie brzmi trochę inaczej
function jitter(freq, pct = 0.015) { return freq * (1 + (Math.random() - 0.5) * pct) }

// ─── Startup — ciepły, pianinowy motyw ───────────────────────
export function soundStartup() {
  // Wspólna baza: ciepły akord, każdy call losuje lekkie odchylenia + jeden z 3 zakończeń
  const ending = pick([
    // 1) dodatkowa wysoka nuta na końcu
    () => note({ freq: jitter(1046), type: 'sine', start: 0.55, duration: 0.55, vol: 0.07, attack: 0.03, release: 0.40 }),
    // 2) glide ozdobnik
    () => glide({ freqFrom: 523, freqTo: 784, start: 0.50, duration: 0.25, vol: 0.06 }),
    // 3) cichy pogłos — dublet akordowy
    () => {
      note({ freq: jitter(392), type: 'sine', start: 0.52, duration: 0.40, vol: 0.06, attack: 0.03, release: 0.30 })
      note({ freq: jitter(659), type: 'sine', start: 0.52, duration: 0.40, vol: 0.05, attack: 0.03, release: 0.30 })
    },
  ])
  note({ freq: jitter(261.6), type: 'sine', start: 0.00, duration: 0.55, vol: 0.09, attack: 0.05, release: 0.35 })
  note({ freq: jitter(329.6), type: 'sine', start: 0.14, duration: 0.50, vol: 0.08, attack: 0.04, release: 0.30 })
  note({ freq: jitter(392.0), type: 'sine', start: 0.28, duration: 0.50, vol: 0.10, attack: 0.03, release: 0.30 })
  note({ freq: jitter(523.2), type: 'sine', start: 0.40, duration: 0.60, vol: 0.09, attack: 0.04, release: 0.38 })
  ending()
}

// ─── Join ─────────────────────────────────────────────────────
export function soundJoin() {
  pick([
    () => {
      note({ freq: jitter(523.2), start: 0.00, duration: 0.18, vol: 0.12 })
      note({ freq: jitter(659.2), start: 0.14, duration: 0.24, vol: 0.11 })
      note({ freq: jitter(1318), start: 0.14, duration: 0.16, vol: 0.04 })
    },
    () => {
      note({ freq: jitter(440), start: 0.00, duration: 0.16, vol: 0.11 })
      note({ freq: jitter(554), start: 0.12, duration: 0.16, vol: 0.11 })
      note({ freq: jitter(659), start: 0.24, duration: 0.22, vol: 0.12 })
    },
    () => {
      glide({ freqFrom: 392, freqTo: 523, start: 0.00, duration: 0.18, vol: 0.10 })
      note({ freq: jitter(784), start: 0.16, duration: 0.22, vol: 0.11 })
    },
  ])()
}

// ─── Leave ────────────────────────────────────────────────────
export function soundLeave() {
  pick([
    () => {
      note({ freq: jitter(523.2), start: 0.00, duration: 0.18, vol: 0.10 })
      note({ freq: jitter(415.3), start: 0.14, duration: 0.28, vol: 0.09, release: 0.22 })
    },
    () => {
      glide({ freqFrom: 440, freqTo: 330, start: 0.00, duration: 0.25, vol: 0.09 })
    },
    () => {
      note({ freq: jitter(392), start: 0.00, duration: 0.14, vol: 0.09 })
      note({ freq: jitter(349), start: 0.12, duration: 0.28, vol: 0.09, release: 0.22 })
    },
  ])()
}

// ─── Permission ───────────────────────────────────────────────
export function soundPermission() {
  pick([
    () => {
      note({ freq: jitter(392), start: 0.00, duration: 0.13, vol: 0.11 })
      note({ freq: jitter(523), start: 0.11, duration: 0.13, vol: 0.11 })
      note({ freq: jitter(659), start: 0.22, duration: 0.22, vol: 0.12 })
      note({ freq: jitter(784), start: 0.22, duration: 0.18, vol: 0.06 })
    },
    () => {
      note({ freq: jitter(440), start: 0.00, duration: 0.13, vol: 0.10 })
      note({ freq: jitter(554), start: 0.11, duration: 0.13, vol: 0.10 })
      note({ freq: jitter(659), start: 0.22, duration: 0.25, vol: 0.12 })
    },
    () => {
      glide({ freqFrom: 440, freqTo: 880, start: 0.00, duration: 0.20, vol: 0.09 })
      note({ freq: jitter(880), start: 0.18, duration: 0.22, vol: 0.11 })
    },
  ])()
}

// ─── Session end ──────────────────────────────────────────────
export function soundSessionEnd() {
  pick([
    () => {
      note({ freq: jitter(440), start: 0.00, duration: 0.26, vol: 0.11 })
      note({ freq: jitter(523), start: 0.00, duration: 0.26, vol: 0.07 })
      note({ freq: jitter(349), start: 0.20, duration: 0.40, vol: 0.10, release: 0.30 })
      note({ freq: jitter(294), start: 0.20, duration: 0.40, vol: 0.06, release: 0.30 })
    },
    () => {
      glide({ freqFrom: 440, freqTo: 220, start: 0.00, duration: 0.35, vol: 0.10 })
      note({ freq: jitter(294), start: 0.25, duration: 0.30, vol: 0.07, release: 0.22 })
    },
    () => {
      note({ freq: jitter(392), start: 0.00, duration: 0.18, vol: 0.10 })
      note({ freq: jitter(370), start: 0.16, duration: 0.18, vol: 0.09 })
      note({ freq: jitter(330), start: 0.32, duration: 0.35, vol: 0.10, release: 0.28 })
    },
  ])()
}

// ─── Create session ───────────────────────────────────────────
export function soundCreateSession() {
  pick([
    () => {
      glide({ freqFrom: 300, freqTo: 600, start: 0.00, duration: 0.18, vol: 0.09 })
      note({ freq: jitter(523), start: 0.16, duration: 0.16, vol: 0.11 })
      note({ freq: jitter(659), start: 0.16, duration: 0.16, vol: 0.09 })
      note({ freq: jitter(784), start: 0.16, duration: 0.22, vol: 0.10 })
    },
    () => {
      note({ freq: jitter(440), start: 0.00, duration: 0.13, vol: 0.10 })
      note({ freq: jitter(554), start: 0.11, duration: 0.13, vol: 0.10 })
      note({ freq: jitter(659), start: 0.22, duration: 0.13, vol: 0.11 })
      note({ freq: jitter(880), start: 0.33, duration: 0.24, vol: 0.11 })
    },
    () => {
      glide({ freqFrom: 261, freqTo: 784, start: 0.00, duration: 0.28, vol: 0.10 })
      note({ freq: jitter(784), start: 0.26, duration: 0.22, vol: 0.11 })
      note({ freq: jitter(988), start: 0.26, duration: 0.18, vol: 0.07 })
    },
  ])()
}

// ─── Switch → Radio (energiczny, rosnący — "wchodzi live") ────
export function soundSwitchRadio() {
  pick([
    // Szybki sweep w górę + dwa uderzenia jak "na antenie"
    () => {
      glide({ freqFrom: 220, freqTo: 880, start: 0.00, duration: 0.14, vol: 0.10 })
      note({ freq: jitter(880), start: 0.12, duration: 0.12, vol: 0.12, attack: 0.004 })
      note({ freq: jitter(1108), start: 0.22, duration: 0.18, vol: 0.10, attack: 0.004 })
    },
    // Dwa krótkie "pip pip" coraz wyżej
    () => {
      note({ freq: jitter(660), start: 0.00, duration: 0.10, vol: 0.11, attack: 0.004, release: 0.06 })
      note({ freq: jitter(880), start: 0.12, duration: 0.10, vol: 0.11, attack: 0.004, release: 0.06 })
      note({ freq: jitter(1046), start: 0.24, duration: 0.18, vol: 0.12, attack: 0.004 })
    },
    // Glide + harmoniczny blask
    () => {
      glide({ freqFrom: 330, freqTo: 990, start: 0.00, duration: 0.20, vol: 0.09 })
      note({ freq: jitter(990), start: 0.18, duration: 0.20, vol: 0.10, attack: 0.005 })
      note({ freq: jitter(1980), start: 0.18, duration: 0.14, vol: 0.04, attack: 0.005 })
    },
  ])()
}

// ─── Switch → Player (spokojny, opadający — "siada do muzyki") ─
export function soundSwitchPlayer() {
  pick([
    // Miękki akord opadający jak "klik play"
    () => {
      note({ freq: jitter(523), start: 0.00, duration: 0.16, vol: 0.10, attack: 0.008 })
      note({ freq: jitter(415), start: 0.13, duration: 0.20, vol: 0.10, attack: 0.008 })
      note({ freq: jitter(330), start: 0.26, duration: 0.28, vol: 0.11, attack: 0.01, release: 0.20 })
    },
    // Powolny sweep w dół + cicha nuta jak "piano"
    () => {
      glide({ freqFrom: 660, freqTo: 220, start: 0.00, duration: 0.24, vol: 0.09 })
      note({ freq: jitter(330), start: 0.20, duration: 0.28, vol: 0.09, release: 0.22 })
      note({ freq: jitter(247), start: 0.20, duration: 0.28, vol: 0.05, release: 0.22 })
    },
    // Trzy nuty schodząco jak klawisze
    () => {
      note({ freq: jitter(494), start: 0.00, duration: 0.13, vol: 0.10, attack: 0.006, release: 0.08 })
      note({ freq: jitter(392), start: 0.12, duration: 0.13, vol: 0.10, attack: 0.006, release: 0.08 })
      note({ freq: jitter(294), start: 0.24, duration: 0.24, vol: 0.11, attack: 0.006, release: 0.18 })
    },
  ])()
}

// ─── Chat message received ────────────────────────────────────
export function soundChatMsg() {
  pick([
    // Krótki cichy "pip" — delikatna notyfikacja
    () => note({ freq: jitter(1046), type: 'sine', start: 0.00, duration: 0.10, vol: 0.06, attack: 0.004, release: 0.07 }),
    // Dwa mini-piknięcia
    () => {
      note({ freq: jitter(880), type: 'sine', start: 0.00, duration: 0.07, vol: 0.05, attack: 0.003, release: 0.05 })
      note({ freq: jitter(1108), type: 'sine', start: 0.08, duration: 0.09, vol: 0.06, attack: 0.003, release: 0.06 })
    },
    // Miękki glide w górę
    () => glide({ freqFrom: 784, freqTo: 1046, start: 0.00, duration: 0.12, vol: 0.05, attack: 0.004 }),
  ])()
}

// ─── Stop ─────────────────────────────────────────────────────
export function soundStop() {
  pick([
    () => glide({ freqFrom: 440, freqTo: 220, start: 0.00, duration: 0.20, vol: 0.09 }),
    () => {
      note({ freq: jitter(392), start: 0.00, duration: 0.14, vol: 0.08 })
      note({ freq: jitter(330), start: 0.12, duration: 0.20, vol: 0.08, release: 0.15 })
    },
    () => glide({ freqFrom: 523, freqTo: 262, start: 0.00, duration: 0.22, vol: 0.08, attack: 0.005 }),
  ])()
}
