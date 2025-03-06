import React, { useContext } from 'react';
import './Web3Connect.css';
import { Web3Context } from '../context/Web3Context';

function Web3Connect({ onError }) {
  const { web3State, connectWallet } = useContext(Web3Context);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      // 调用传入的 onError 函数来显示 Toast
      onError(error.message);
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
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default Web3Connect;