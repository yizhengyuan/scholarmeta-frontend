import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import { authAPI } from '../router';  // 导入 authAPI
import './LoginPage.css';

function LoginPage({ onLoginSuccess, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const particlesRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Particle background effect
  useEffect(() => {
    const canvas = particlesRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    
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
      particles = [];
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
      animationFrameId = requestAnimationFrame(animate);
    };
    
    createParticles();
    animate();
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('resize', resizeCanvas);
      particles = [];
    };
  }, []);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      // 注释掉真实的登录逻辑
      /*
      // 登录
      const response = await authAPI.login(username, password);
      localStorage.setItem('access_token', response.access_token);
      
      // 获取用户数据
      const userData = await authAPI.getMe();
      */
      
      // 临时模拟登录成功
      localStorage.setItem('access_token', 'mock_token_for_demo');
      
      // 模拟用户数据
      const mockUserData = {
        id: 1,
        name: "演示用户",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        title: "化学实验室研究员",
        url: "https://example.com/profile",
        bio: "这是一个演示用户的个人简介。热爱科学研究，专注于化学实验和数据分析。\n\n在这里可以分享我的研究成果和实验心得。",
        created_at: "2023-01-15T08:30:00Z"
      };
      
      // 传递模拟用户数据给父组件
      if (onLoginSuccess) {
        onLoginSuccess(mockUserData);
      }
      
      // 关闭登录页面
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Login failed:', error);
      setLoginError('Invalid username or password. Please try again.');
    } finally {
      setIsLoading(false);
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            
            <motion.button 
              type="submit"
              className={`login-button ${isLoading ? 'loading' : ''}`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="login-spinner"></div>
              ) : (
                <>
                  <FaSignInAlt />
                  <span>Sign In</span>
                </>
              )}
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
