import '../polyfills';  // 必须是第一个导入
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { Web3Provider } from './context/Web3Context'
import { AppProvider } from './context/AppContext'
import { Buffer } from 'buffer'

window.Buffer = Buffer

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <Web3Provider>
          <App />
        </Web3Provider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
)