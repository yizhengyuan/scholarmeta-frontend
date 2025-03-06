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

  // 使用 web3State 中的 connection
  const connection = web3State.connection;
  const SOURCE_WALLET = 'AxTG7LE8bkWKCQ5LMkKzyKZF2XskRHDxse4GYoh1ofFP';
  const SOURCE_TOKEN_ACCOUNT = '8WKpeYVYphduTBUt9oTwfDxgLgcofUifovghoxagEf29';
  const TOKEN_MINT_ADDRESS = 'Y9MrRCsGTV3zy73bYBxsUSFmYQ1cZdcm9xaNrjgzbZv';
  const MINIMUM_RENT_EXEMPT_BALANCE = 990880;

  // 从 base58 私钥创建 Keypair
  const sourceKeypair = Keypair.fromSecretKey(
    bs58.decode('3AJN9gDD1hfMHapc4nEzwPiViB6VEMGGeq7wwmmmUhDuiw4FTGSHProqB5RXKsyKBoxAM5zTavJP79rtg6rGVUL1')
  );

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
    if (!web3State.connected) {
      setAddress(e.target.value);
      // 当用户输入地址时，尝试获取账户信息
      try {
        const pubKey = new PublicKey(e.target.value);
        connection.getAccountInfo(pubKey).then(accountInfo => {
          if (!accountInfo) {
            console.log('账户未激活');
          } else {
            console.log('账户已激活');
          }
        });
      } catch (err) {
        console.log('无效的地址格式');
      }
    }
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const verifyAccounts = async () => {
    try {
      // 验证源账户
      const sourceWallet = new PublicKey(SOURCE_WALLET);
      console.log('Verifying source account:', SOURCE_WALLET);
      const sourceInfo = await connection.getAccountInfo(sourceWallet);
      if (!sourceInfo) {
        setError('Source account does not exist or is not activated');
        return false;
      }

      // 验证源代币账户
      const sourceTokenAccountPubkey = new PublicKey(SOURCE_TOKEN_ACCOUNT);
      console.log('Verifying source token account:', SOURCE_TOKEN_ACCOUNT);
      const sourceTokenInfo = await connection.getAccountInfo(sourceTokenAccountPubkey);
      if (!sourceTokenInfo) {
        setError('Source token account does not exist or is not activated');
        return false;
      }

      // 验证目标账户
      let recipientPubkey;
      try {
        recipientPubkey = new PublicKey(address);
      } catch (error) {
        setError('Invalid Solana address');
        return false;
      }

      console.log('Verifying target account:', address);
      const recipientInfo = await connection.getAccountInfo(recipientPubkey);
      
      if (!recipientInfo) {
        console.log('Target account not activated, sending minimum activation amount...');
        try {
          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: sourceKeypair.publicKey,
              toPubkey: recipientPubkey,
              lamports: MINIMUM_RENT_EXEMPT_BALANCE
            })
          );

          const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [sourceKeypair]
          );

          console.log('Account activation successful, signature:', signature);
        } catch (error) {
          console.error('Account activation failed:', error);
          setError('Account activation failed: ' + error.message);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Account verification failed:', error);
      setError('Account verification failed: ' + error.message);
      return false;
    }
  };

  const handleGetTokens = async () => {
    if (!address) {
      setError("Please enter receiving address");
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
          connection,
          sourceKeypair,
          mintPubkey,
          recipientAddress
        );

        console.log('接收方代币账户:', recipientTokenAccount.address.toString());

        // 创建转账交易
        const transaction = new Transaction().add(
          spl.createTransferInstruction(
            new PublicKey(SOURCE_TOKEN_ACCOUNT),
            recipientTokenAccount.address,
            sourceKeypair.publicKey,
            amount * Math.pow(10, 9)
          )
        );

        // 签署并发送交易
        const signature = await sendAndConfirmTransaction(
          connection,
          transaction,
          [sourceKeypair]
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
      console.error("Token transfer failed:", err);
      setError(err.message || "Token transfer failed, please try again");
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
