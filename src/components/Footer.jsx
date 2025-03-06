import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Web3文件上传与代币应用</p>
        <div className="footer-links">
          <a href="#" target="_blank" rel="noopener noreferrer">隐私政策</a>
          <a href="#" target="_blank" rel="noopener noreferrer">使用条款</a>
          <a href="#" target="_blank" rel="noopener noreferrer">联系我们</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;