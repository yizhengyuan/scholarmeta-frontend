import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Web3文件上传与代币应用</h1>
        <p>一个去中心化的文件存储和代币管理平台</p>
        <div className="hero-buttons">
          <Link to="/upload" className="primary-button">上传文件</Link>
          <Link to="/token" className="secondary-button">获取代币</Link>
        </div>
      </div>
      
      <div className="features-section">
        <h2>主要功能</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>去中心化存储</h3>
            <p>将您的文件安全地存储在IPFS网络上，确保数据的永久性和抗审查性。</p>
          </div>
          <div className="feature-card">
            <h3>代币管理</h3>
            <p>轻松管理您的代币，支持多种代币类型和跨链操作。</p>
          </div>
          <div className="feature-card">
            <h3>安全可靠</h3>
            <p>基于区块链技术，确保您的数据和资产安全。</p>
          </div>
          <div className="feature-card">
            <h3>用户友好</h3>
            <p>简洁直观的界面设计，让区块链技术变得简单易用。</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;