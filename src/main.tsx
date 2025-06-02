import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LandingPage } from './pages/Landing/index.tsx'
import MethodNorthWest from './pages/Methods/MethodNorthWest/index.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/proyects" element={<MethodNorthWest />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
