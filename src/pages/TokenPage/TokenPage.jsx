import { Buffer } from 'buffer';
import React, { useState, useContext, useRef, useEffect } from 'react';
import './TokenPage.css';
import { Web3Context } from '../../context/Web3Context';
import { Connection, PublicKey, Transaction, Keypair, sendAndConfirmTransaction, SystemProgram } from '@solana/web3.js';
import * as spl from '@solana/spl-token';
import AOS from 'aos';
import 'aos/dist/aos.css';
import bs58 from 'bs58';  // 需要安装: npm install bs58

// 确保全局可用
window.Buffer = Buffer;

function TokenPage() {
  const { web3State } = useContext(Web3Context);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const particlesRef = useRef(null);

  // 使用 web3State 中的 connection 而不是创建新的连接
  const connection = web3State.connection;
  const SOURCE_WALLET = 'AxTG7LE8bkWKCQ5LMkKzyKZF2XskRHDxse4GYoh1ofFP';  // 源账户的 Solana 地址
  const SOURCE_TOKEN_ACCOUNT = '8WKpeYVYphduTBUt9oTwfDxgLgcofUifovghoxagEf29';  // 源代币账户地址
  const TOKEN_MINT_ADDRESS = 'Y9MrRCsGTV3zy73bYBxsUSFmYQ1cZdcm9xaNrjgzbZv';

  // 从 base58 私钥创建 Keypair
  const sourceKeypair = Keypair.fromSecretKey(
    bs58.decode('3AJN9gDD1hfMHapc4nEzwPiViB6VEMGGeq7wwmmmUhDuiw4FTGSHProqB5RXKsyKBoxAM5zTavJP79rtg6rGVUL1')
  );

  // 最小账户租金豁免金额（约 0.00089088 SOL）
  const MINIMUM_RENT_EXEMPT_BALANCE = 990880;

  useEffect(() => {
    // 初始化 AOS
    if (!document.body.hasAttribute('data-aos-initialized')) {
      AOS.init({
        duration: 1000,
        once: true,
        offset: 100,
      });
      document.body.setAttribute('data-aos-initialized', 'true');
    }

    // 粒子背景效果
    const canvas = particlesRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = `rgba(97, 218, 251, ${Math.random() * 0.5 + 0.2})`;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > canvas.width) this.x = 0;
        else if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        else if (this.y < 0) this.y = canvas.height;
      }
      
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    const createParticles = () => {
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };
    
    const connectParticles = () => {
      const maxDistance = 150;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            const opacity = 1 - (distance / maxDistance);
            ctx.strokeStyle = `rgba(97, 218, 251, ${opacity * 0.2})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      
      connectParticles();
      requestAnimationFrame(animate);
    };
    
    createParticles();
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      particles = [];
    };
  }, []);

  useEffect(() => {
    if (web3State.connected) {
      setAddress(web3State.address);
    }
  }, [web3State.connected, web3State.address]);

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const verifyAccounts = async () => {
    try {
      // 验证源账户
      console.log(connection)
      const sourceWallet = new PublicKey(SOURCE_WALLET);
      console.log('正在验证源账户:', SOURCE_WALLET);
      const sourceInfo = await connection.getAccountInfo(sourceWallet);
      if (sourceInfo) {
        console.log('源账户存在且已激活');
      } else {
        console.log('源账户不存在或未激活');
        setError('源账户不存在或未激活');
        return false;
      }

      // 验证源代币账户
      const sourceTokenAccountPubkey = new PublicKey(SOURCE_TOKEN_ACCOUNT);
      console.log('正在验证源代币账户:', SOURCE_TOKEN_ACCOUNT);
      const sourceTokenInfo = await connection.getAccountInfo(sourceTokenAccountPubkey);
      if (sourceTokenInfo) {
        console.log('源代币账户存在且已激活');
      } else {
        console.log('源代币账户不存在或未激活');
        setError('源代币账户不存在或未激活');
        return false;
      }

      // 验证目标账户（连接的钱包）
      if (!web3State.address) {
        setError('请先连接钱包');
        return false;
      }
      console.log('正在验证目标账户:', web3State.address);
      const recipientPubkey = new PublicKey(web3State.address);
      const recipientInfo = await connection.getAccountInfo(recipientPubkey);
      
      if (!recipientInfo) {
        console.log('目标账户未激活，正在发送最小激活金额...');
        try {
          // 创建转账交易来激活账户
          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: sourceKeypair.publicKey,
              toPubkey: recipientPubkey,
              lamports: MINIMUM_RENT_EXEMPT_BALANCE // 使用最小激活金额
            })
          );

          // 发送并确认交易
          const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [sourceKeypair]
          );

          console.log('账户激活成功，交易签名:', signature);
        } catch (error) {
          console.error('激活账户失败:', error);
          setError('激活账户失败: ' + error.message);
          return false;
        }
      } else {
        console.log('目标账户已激活');
      }

      return true;
    } catch (error) {
      console.error('验证账户失败:', error);
      setError('验证账户失败: ' + error.message);
      return false;
    }
  };

  const handleGetTokens = async () => {
    if (!web3State.connected) {
      setError("请先连接钱包");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 首先验证所有账户
      const accountsValid = await verifyAccounts();
      if (!accountsValid) {
        setLoading(false);
        return;
      }

      // 验证地址
      const recipientAddress = new PublicKey(address);
      const mintPubkey = new PublicKey(TOKEN_MINT_ADDRESS);
      console.log('接收方信息', connection, sourceKeypair, mintPubkey, recipientAddress);
      try {
        // 获取或创建接收方的代币账户
        const recipientTokenAccount = await spl.getOrCreateAssociatedTokenAccount(
          connection,                    // connection
          sourceKeypair,                // payer (源账户支付创建账户费用)
          mintPubkey,                   // mint (代币的 mint 地址)
          recipientAddress              // owner (接收方地址)
        );

        console.log('接收方代币账户:', recipientTokenAccount.address.toString());

        // 创建转账交易
        const transaction = new Transaction().add(
          spl.createTransferInstruction(
            new PublicKey(SOURCE_TOKEN_ACCOUNT),  // 源代币账户
            recipientTokenAccount.address,         // 接收方的代币账户
            sourceKeypair.publicKey,              // authority (源账户作为付款方)
            amount * Math.pow(10, 9)              // 代币数量
          )
        );

        // 签署并发送交易
        const signature = await sendAndConfirmTransaction(
          connection,
          transaction,
          [sourceKeypair]  // 使用源账户的密钥对签名
        );

        console.log('交易签名:', signature);

        setResult({
          success: true,
          txHash: signature,
          amount,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error("代币操作失败:", error);
        if (error.message.includes("insufficient funds")) {
          setError("SOL 余额不足，无法创建代币账户");
        } else {
          setError("代币操作失败: " + error.message);
        }
        return;
      }

    } catch (err) {
      console.error("代币转账失败:", err);
      setError(err.message || "代币转账失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="token-root">
      <canvas ref={particlesRef} className="token-particles"></canvas>
      
      <div className="token-hero">
        <h1 className="token-title" data-aos="fade-down">
          Token Management
          <span className="token-title-accent">Seamless Token Operations</span>
        </h1>
      </div>

      <div className="token-content">
        <div data-aos="fade-up" data-aos-once="true">
          {web3State.connected ? (
            <div className="token-wallet-info">
              <div className="wallet-header">
                <span className="wallet-icon">👛</span>
                <h2>Your Wallet</h2>
              </div>
              <div className="wallet-details">
                <div className="wallet-row">
                  <span className="wallet-label">Address</span>
                  <span className="wallet-value">{web3State.address}</span>
                </div>
                <div className="wallet-row">
                  <span className="wallet-label">Network</span>
                  <span className="wallet-value">{web3State.networkName}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="token-connect-prompt">
              <div className="prompt-icon">🔐</div>
              <h2>Connect Your Wallet</h2>
              <p>Please connect your wallet to manage tokens</p>
            </div>
          )}
        </div>

        <div className="token-operation-card" data-aos="fade-up" data-aos-once="true">
          <div className="operation-header">
            <span className="operation-icon">💎</span>
            <h2>Get Tokens</h2>
          </div>

          <div className="token-form">
            {!web3State.connected && (
              <div className="form-group">
                <label htmlFor="token-address">
                  <span className="label-icon">📬</span>
                  Receiving Address
                </label>
                <input
                  id="token-address"
                  type="text"
                  value={address}
                  onChange={handleAddressChange}
                  placeholder="Enter receiving address"
                  className="token-input"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="token-amount">
                <span className="label-icon">💰</span>
                Amount
              </label>
              <input
                id="token-amount"
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter token amount"
                className="token-input"
                min="0"
              />
            </div>

            <button 
              className="token-submit-button"
              onClick={handleGetTokens}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  <span className="button-icon">✨</span>
                  Get Tokens
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="token-error" data-aos="fade">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
            </div>
          )}

          {result && (
            <div className="token-success" data-aos="fade-up">
              <div className="success-header">
                <span className="success-icon">🎉</span>
                <h3>Transaction Successful!</h3>
              </div>
              <div className="success-details">
                <div className="detail-row">
                  <span className="detail-label">Receiving Address</span>
                  <span className="detail-value hash">{address}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Amount</span>
                  <span className="detail-value">{result.amount} Tokens</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Transaction Hash</span>
                  <span className="detail-value hash">{result.txHash}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Time</span>
                  <span className="detail-value">
                    {new Date(result.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TokenPage;
