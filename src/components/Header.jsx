import React, { useContext, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Header.css';
import Web3Connect from './Web3Connect';
import { Web3Context } from '../context/Web3Context';

function Header() {
  const { web3State } = useContext(Web3Context);
  const [error, setError] = useState(null);

  const handleError = (error) => {
    console.log("Error object:", error);
    
    // 简化错误处理
    let message = '';
    if (error === "Please install Phantom Wallet") {
      message = "Please install Phantom Wallet 🦊";
    } else if (error.message && error.message.includes("rejected")) {
      message = "Connection request rejected ❌";
    } else {
      message = "Connection failed ⚠️";
    }

    setError(message);
    setTimeout(() => setError(null), 3000);
  };

  return (
    <header className="header-nav">
      <div className="header-logo">
        <Link to="/" className="header-logo-link">Web3 App</Link>
      </div>
      <nav className="header-menu">
        <ul>
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                isActive ? 'header-link active' : 'header-link'
              } 
              end
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/forum" 
              className={({ isActive }) => 
                isActive ? 'header-link active' : 'header-link'
              }
            >
              Forum
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/upload" 
              className={({ isActive }) => 
                isActive ? 'header-link active' : 'header-link'
              }
            >
              Upload
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/token" 
              className={({ isActive }) => 
                isActive ? 'header-link active' : 'header-link'
              }
            >
              Tokens
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/mypage" 
              className={({ isActive }) => 
                isActive ? 'header-link active' : 'header-link'
              }
            >
              My Page
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="header-wallet">
        <Web3Connect onError={handleError} />
      </div>
      
      {/* 简单的错误提示 */}
      {error && (
        <div className="header-error">
          {error}
        </div>
      )}
    </header>
  );
}

export default Header;