import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import '../../vue/src/style.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div id="app">
      <App />
    </div>
  </StrictMode>,
)
