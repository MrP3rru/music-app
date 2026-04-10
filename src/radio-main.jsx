import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import RadioPWA from './RadioPWA.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RadioPWA />
  </StrictMode>
)
