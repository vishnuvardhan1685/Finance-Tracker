import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import TanstackProvider from './providers/TanstackProvider'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <TanstackProvider>
        <App />
      </TanstackProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
