import React, { useState, useContext, useRef, useEffect } from 'react';
import './UploadPage.css';
import { Web3Context } from '../../context/Web3Context';
import AOS from 'aos';

function UploadPage() {
  const { web3State } = useContext(Web3Context);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const particlesRef = useRef(null);

  useEffect(() => {
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
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    if (!web3State.connected) {
      setError("Please connect your wallet first");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);
      
      // 模拟文件上传
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // 模拟IPFS哈希
      const ipfsHash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      setUploadResult({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        ipfsHash,
        timestamp: new Date().toISOString()
      });
      
      // 重置文件选择
      setTimeout(() => {
        setFile(null);
        setUploading(false);
        setProgress(0);
      }, 1000);
      
    } catch (err) {
      console.error("上传文件失败:", err);
      setError("上传文件失败，请重试");
      setUploading(false);
    }
  };

  return (
    <div className="upload-root">
      <canvas ref={particlesRef} className="upload-particles"></canvas>
      
      <div className="upload-hero">
        <h1 className="upload-title" data-aos="fade-down">
          Decentralized Storage
          <span className="upload-title-accent">on IPFS</span>
        </h1>
      </div>

      <div className="upload-content" data-aos="fade-up">
        {!web3State.connected ? (
          <div className="upload-connect-prompt">
            <div className="prompt-icon">🔐</div>
            <h2>Connect Your Wallet</h2>
            <p>Please connect your wallet to start uploading files</p>
          </div>
        ) : (
          <div className="upload-main">
            <div className="upload-card">
              <div className="upload-header">
                <span className="upload-header-icon">📤</span>
                <h2>Upload Your File</h2>
              </div>
              
              <div className="upload-area">
                <input 
                  type="file" 
                  id="file-input" 
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="upload-input"
                />
                <label 
                  htmlFor="file-input" 
                  className={`upload-label ${uploading ? 'disabled' : ''}`}
                >
                  {file ? (
                    <div className="file-info">
                      <span className="file-icon">📄</span>
                      <span className="file-name">{file.name}</span>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">📁</span>
                      <span>Choose a file or drag it here</span>
                    </div>
                  )}
                </label>
              </div>

              {file && !uploading && (
                <button 
                  className="upload-button"
                  onClick={handleUpload}
                  disabled={!web3State.connected}
                >
                  Upload to IPFS
                </button>
              )}

              {uploading && (
                <div className="upload-progress">
                  <div className="progress-track">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${progress}%` }}
                    >
                      <div className="progress-glow"></div>
                    </div>
                  </div>
                  <span className="progress-text">{progress}%</span>
                </div>
              )}
            </div>

            {error && (
              <div className="upload-error" data-aos="fade">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{error}</span>
              </div>
            )}

            {uploadResult && (
              <div className="upload-success" data-aos="fade-up">
                <div className="success-header">
                  <span className="success-icon">✨</span>
                  <h3>Upload Successful!</h3>
                </div>
                
                <div className="success-details">
                  <div className="detail-row">
                    <span className="detail-label">File Name</span>
                    <span className="detail-value">{uploadResult.fileName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Size</span>
                    <span className="detail-value">{Math.round(uploadResult.fileSize / 1024)} KB</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">IPFS Hash</span>
                    <span className="detail-value hash">{uploadResult.ipfsHash}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Time</span>
                    <span className="detail-value">
                      {new Date(uploadResult.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <a 
                  href={`https://ipfs.io/ipfs/${uploadResult.ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-link"
                >
                  View on IPFS
                  <span className="link-icon">↗️</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadPage;
