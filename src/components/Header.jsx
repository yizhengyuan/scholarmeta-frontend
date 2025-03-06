import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import Web3Connect from './Web3Connect';
import { Web3Context } from '../context/Web3Context';

function Header() {
  const { web3State } = useContext(Web3Context);

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Web3应用</Link>
      </div>
      <nav className="nav">
        <ul>
          <li><Link to="/">首页</Link></li>
          <li><Link to="/upload">文件上传</Link></li>
          <li><Link to="/token">代币</Link></li>
        </ul>
      </nav>
      <div className="wallet">
        <Web3Connect />
      </div>
    </header>
  );
}

export default Header;