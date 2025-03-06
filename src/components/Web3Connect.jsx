import React, { useState, useContext } from 'react';
import './Web3Connect.css';
import { Web3Context } from '../context/Web3Context';

function Web3Connect() {
  const { web3State, connectWallet } = useContext(Web3Context);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    if (connecting) return;
    
    try {
      setConnecting(true);
      await connectWallet();
    } catch (error) {
      console.error("连接钱包失败:", error);
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
        <button 
          className="connect-button" 
          onClick={handleConnect}
          disabled={connecting}
        >
          {connecting ? '连接中...' : '连接钱包'}
        </button>
      )}
    </div>
  );
}

export default Web3Connect;