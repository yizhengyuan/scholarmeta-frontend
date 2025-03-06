import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './HomePage.css';

function HomePage() {
  const particlesRef = useRef(null);
  
  useEffect(() => {
    // 初始化 AOS
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });

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

  return (
    <div className="home-page">
      <canvas ref={particlesRef} className="particles-bg"></canvas>
      <div className="home-content">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="gradient-text">Web3 File Upload & Token Application</h1>
            <p className="hero-description">Explore the infinite possibilities of blockchain, securely store files and manage your digital assets</p>
            <div className="hero-buttons">
              <Link to="/upload" className="primary-button">
                <span className="button-icon">📤</span>
                <span className="button-text">Upload Files</span>
              </Link>
              <Link to="/token" className="secondary-button">
                <span className="button-icon">💰</span>
                <span className="button-text">Get Tokens</span>
              </Link>
            </div>
          </div>
          
          <div className="hero-image">
            <div className="cube-wrapper">
              <div className="cube">
                <div className="cube-face front"></div>
                <div className="cube-face back"></div>
                <div className="cube-face right"></div>
                <div className="cube-face left"></div>
                <div className="cube-face top"></div>
                <div className="cube-face bottom"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="features-section">
          <h2 className="section-title">Explore Features</h2>
          <div className="features-grid">
            <div className="feature-card" data-aos="fade-up">
              <div className="feature-icon">🔐</div>
              <h3>Decentralized Storage</h3>
              <p>Store your files securely on the IPFS network, ensuring data permanence and censorship resistance.</p>
            </div>
            <div className="feature-card" data-aos="fade-up" data-aos-delay="100">
              <div className="feature-icon">💎</div>
              <h3>Token Management</h3>
              <p>Easily manage your tokens, supporting multiple token types and cross-chain operations.</p>
            </div>
            <div className="feature-card" data-aos="fade-up" data-aos-delay="200">
              <div className="feature-icon">🛡️</div>
              <h3>Secure & Reliable</h3>
              <p>Based on blockchain technology, ensuring the security of your data and assets.</p>
            </div>
            <div className="feature-card" data-aos="fade-up" data-aos-delay="300">
              <div className="feature-icon">🚀</div>
              <h3>User Friendly</h3>
              <p>Clean and intuitive interface design makes blockchain technology simple to use.</p>
            </div>
          </div>
        </div>
        
        <div className="stats-section">
          <div className="stat-item">
            <div className="stat-number">25,431</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">157,892</div>
            <div className="stat-label">Stored Files</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">1,892,456</div>
            <div className="stat-label">Total Transactions</div>
          </div>
        </div>
        
        <div className="cta-section">
          <div className="cta-content">
            <h2>Ready to Start Your Web3 Journey?</h2>
            <p>Connect your wallet now and experience the magic of decentralized applications</p>
            <Link to="/upload" className="cta-button">Get Started</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;