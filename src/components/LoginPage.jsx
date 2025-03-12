import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import './LoginPage.css';

function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const particlesRef = useRef(null);
  
  // Particle background effect
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
        this.color = '#61dafb';
        this.alpha = Math.random() * 0.5 + 0.1;
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
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
      }
    }
    
    const createParticles = () => {
      const particleCount = Math.min(100, Math.floor(window.innerWidth * window.innerHeight / 10000));
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      
      requestAnimationFrame(animate);
    };
    
    createParticles();
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      particles = [];
    };
  }, []);
  
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setLoginError('');
      // Generate simple token and store
      const token = btoa(`${username}:${Date.now()}`);
      localStorage.setItem('myPageToken', token);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } else {
      setLoginError('Invalid username or password');
    }
  };

  return (
    <div className="login-page">
      <canvas ref={particlesRef} className="login-particles-bg"></canvas>
      
      <div className="login-container">
        <motion.div 
          className="login-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="login-header">
            <div className="login-logo">
              <FaUser />
            </div>
            <h2>Welcome Back</h2>
            <p>Sign in to access your personal dashboard</p>
          </div>
          
          {loginError && (
            <div className="login-error">
              {loginError}
            </div>
          )}
          
          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-form-group">
              <label htmlFor="username">Username</label>
              <div className="login-input-wrapper">
                <FaUser className="login-input-icon" />
                <input 
                  type="text" 
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>
            
            <div className="login-form-group">
              <label htmlFor="password">Password</label>
              <div className="login-input-wrapper">
                <FaLock className="login-input-icon" />
                <input 
                  type="password" 
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            
            <motion.button 
              type="submit"
              className="login-button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaSignInAlt />
              <span>Sign In</span>
            </motion.button>
          </form>
          
          <div className="login-footer">
            <p>Default login: admin / admin</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default LoginPage;
