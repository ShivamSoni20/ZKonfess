import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { contentStorage } from './services/contentStorage'

// Seed mock content for the feed demonstration
contentStorage.seedInitialContent();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
