import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LandingPage } from './pages/Landing/index.tsx'
import { MethodsPage } from './pages/Methods/index.tsx'
import MethodNorthWest from './pages/Methods/MethodNorthWest/index.tsx'
import MethodVogel from './pages/Methods/MethodVogel/index.tsx'
import MethodCorner from './pages/Methods/MethodCorner/index.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/proyects" element={<MethodsPage />} />
        <Route path="/proyects/northwest" element={<MethodNorthWest />} />
        <Route path="/proyects/corner" element={<MethodCorner />} />
        <Route path="/proyects/vogel" element={<MethodVogel />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
