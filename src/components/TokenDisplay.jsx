import React, { useState, useEffect } from 'react';
import './TokenDisplay.css';

function TokenDisplay({ address, getBalance }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (address) {
      fetchBalance();
    }
  }, [address]);

  const fetchBalance = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const balanceData = await getBalance();
      setBalance(balanceData);
    } catch (err) {
      console.error("获取余额失败:", err);
      setError("无法获取代币余额");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="token-display">
      <h3>代币余额</h3>
      
      {loading && <div className="loading">加载中...</div>}
      
      {error && <div className="error">{error}</div>}
      
      {balance && !loading && !error && (
        <div className="balance-info">
          <div className="balance-amount">
            {balance.balance} <span className="token-symbol">{balance.symbol}</span>
          </div>
          <button className="refresh-button" onClick={fetchBalance} disabled={loading}>
            刷新
          </button>
        </div>
      )}
    </div>
  );
}

export default TokenDisplay;
