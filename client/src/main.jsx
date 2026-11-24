import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/frank-ruhl-libre'
import './styles.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
