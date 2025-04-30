import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import ErrorBoundary from './components/public_base_component/ErrorBoundary'
import ResponsiveWrapper from './components/public_base_component/ResponsiveWrapper'
import Loading from './components/public_base_component/loading'

// 导入页面
import HomePage from './pages/HomePage/HomePage'
import UploadPage from './pages/UploadPage/UploadPage'
import TokenPage from './pages/TokenPage/TokenPage'
import ForumPage from './pages/ForumPage/ForumPage'
import ForumDetailPage from './pages/ForumDetailPage/ForumDetailPage'
import AuthorPage from './pages/AuthorPage/AuthorPage'
import MyPage from './pages/MyPage/MyPage'

// 导入组件
import Header from './components/Header'
import Footer from './components/Footer'

function App() {
  return (
    <ErrorBoundary>
      <ResponsiveWrapper>
        <div className="app">
          <Header />
          <div className="page-container">
            <main className="main-content">
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/upload" element={<UploadPage />} />
                  <Route path="/token" element={<TokenPage />} />
                  <Route path="/forum" element={<ForumPage />} />
                  <Route path="/forum/detail/:id" element={<ForumDetailPage />} />
                  <Route path="/author/:id" element={<AuthorPage />} />
                  <Route path="/mypage" element={<MyPage />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </div>
      </ResponsiveWrapper>
    </ErrorBoundary>
  )
}

export default App