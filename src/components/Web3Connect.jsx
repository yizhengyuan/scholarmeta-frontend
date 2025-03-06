import React, { useState, useContext, useEffect } from 'react';
import './Web3Connect.css';
import { Web3Context } from '../context/Web3Context';

function Web3Connect({ onError }) {
  const { web3State, connectWallet } = useContext(Web3Context);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (error) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
        setTimeout(() => setError(null), 300); // 等待淡出动画完成后清除错误
      }, 3000); // 3秒后开始淡出

      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleConnect = async () => {
    if (connecting) return;
    
    try {
      setError(null);
      setConnecting(true);
      await connectWallet();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      if (typeof onError === 'function') {
        if (error.code === 4001) {
          onError("User rejected the request");
        } else {
          onError(error.message || "Failed to connect wallet");
        }
      }
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="web3-connect">
      {web3State.connected ? (
        <div className="connected-account">
          <span className="network-badge">{web3State.networkName}</span>
          <span className="address">
            {web3State.address.substring(0, 6)}...{web3State.address.substring(web3State.address.length - 4)}
          </span>
        </div>
      ) : (
        <>
          <button 
            className="connect-button" 
            onClick={handleConnect}
            disabled={connecting}
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          {error && (
            <div className={`toast-message ${showToast ? 'show' : ''}`}>
              <div className="toast-icon">⚠️</div>
              <div className="toast-content">{error}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Web3Connect;