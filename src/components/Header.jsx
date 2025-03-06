import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Header.css';
import Web3Connect from './Web3Connect';
import { Web3Context } from '../context/Web3Context';

function Header() {
  const { web3State } = useContext(Web3Context);

  return (
    <header className="header">
      <div className="logo">
        <Link to="/" className="logo-link">Web3 App</Link>
      </div>
      <nav className="nav">
        <ul>
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              end
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/upload" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              Upload
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/token" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              Tokens
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="wallet">
        <Web3Connect />
      </div>
    </header>
  );
}

export default Header;