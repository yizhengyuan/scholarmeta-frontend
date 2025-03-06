import React, { useState, useContext } from 'react';
import './TokenPage.css';
import { Web3Context } from '../../context/Web3Context';

function TokenPage() {
  const { web3State } = useContext(Web3Context);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleGetTokens = async () => {
    if (!web3State.connected) {
      setError("请先连接钱包");
      return;
    }

    if (!address || !address.trim()) {
      setError("请输入有效的地址");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 这里实现获取代币的逻辑
      // 由于我们还没有实现web3.js，先模拟一个成功的结果
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setResult({
        success: true,
        txHash: '0x' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        amount,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("获取代币失败:", err);
      setError("获取代币失败，请检查地址并重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="token-page">
      <h1>代币管理</h1>
      
      {web3State.connected ? (
        <div className="token-info">
          <h2>您的钱包</h2>
          <p>地址: {web3State.address}</p>
          <p>网络: {web3State.networkName}</p>
        </div>
      ) : (
        <div className="connect-prompt">
          <p>请连接您的钱包以管理代币</p>
        </div>
      )}
      
      <div className="token-form">
        <h2>获取代币</h2>
        
        <div className="form-group">
          <label htmlFor="token-address">接收地址</label>
          <input
            type="text"
            id="token-address"
            value={address}
            onChange={handleAddressChange}
            placeholder="输入接收地址"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="token-amount">代币数量</label>
          <input
            type="number"
            id="token-amount"
            value={amount}
            onChange={handleAmountChange}
            placeholder="输入代币数量"
            disabled={loading}
            min="0"
          />
        </div>
        
        <button 
          className="get-tokens-button"
          onClick={handleGetTokens}
          disabled={loading || !web3State.connected}
        >
          {loading ? '处理中...' : '获取代币'}
        </button>
        
        {error && <div className="error-message">{error}</div>}
        
        {result && (
          <div className="success-message">
            <h3>交易成功!</h3>
            <p>交易哈希: {result.txHash}</p>
            <p>代币数量: {result.amount}</p>
            <p>交易时间: {new Date(result.timestamp).toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TokenPage;
