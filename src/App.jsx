import React from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'

// 导入页面
import HomePage from './pages/HomePage/HomePage'
import UploadPage from './pages/UploadPage/UploadPage'
import TokenPage from './pages/TokenPage/TokenPage'

// 导入组件
import Header from './components/Header'
import Footer from './components/Footer'

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/token" element={<TokenPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App