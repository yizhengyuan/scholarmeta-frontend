import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Web3 File Upload & Token Application</p>
        <div className="footer-links">
          <a href="#" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          <a href="#" target="_blank" rel="noopener noreferrer">Terms of Use</a>
          <a href="#" target="_blank" rel="noopener noreferrer">Contact Us</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;