import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LandingPage } from './LandingPage'
import { ErrorBoundary } from './components/ErrorBoundary'

function Root() {
  const [route, setRoute] = useState(window.location.hash)

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('app-mode', route === '#/app')
  }, [route])

  if (route === '#/app') {
    return (
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    )
  }

  return <LandingPage onEnterApp={() => { window.location.hash = '#/app' }} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
