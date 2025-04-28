import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaSignInAlt, FaEnvelope, FaPhone, FaUserPlus } from 'react-icons/fa';
import { authAPI } from '../router';  // 导入 authAPI
import './LoginPage.css';

function LoginPage({ onLoginSuccess, onClose }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
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
  
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isRegistering) {
        // Registration logic
        const registerData = {
          name: formData.username,
          password: formData.password,
          email: formData.email || undefined,
          phone: formData.phone || undefined
        };

        const response = await authAPI.register(registerData);
        // Auto login after successful registration
        const loginResponse = await authAPI.login(formData.username, formData.password);
        localStorage.setItem('access_token', loginResponse.access_token);
        
        if (onLoginSuccess) {
          const userData = await authAPI.getMe();
          onLoginSuccess(userData);
        }
        
        if (onClose) {
          onClose();
        }
      } else {
        // Login logic
        const response = await authAPI.login(formData.username, formData.password);
        localStorage.setItem('access_token', response.access_token);
        
        if (onLoginSuccess) {
          const userData = await authAPI.getMe();
          onLoginSuccess(userData);
        }
        
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error(isRegistering ? 'Registration failed:' : 'Login failed:', error);
      setError(isRegistering ? 'Registration failed, please try again' : 'Invalid username or password');
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
              {isRegistering ? <FaUserPlus /> : <FaUser />}
            </div>
            <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
            <p>{isRegistering ? 'Fill in your information to register' : 'Sign in to access your dashboard'}</p>
          </div>
          
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label htmlFor="username">Username</label>
              <div className="login-input-wrapper">
                <FaUser className="login-input-icon" />
                <input 
                  type="text" 
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter username"
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
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {isRegistering && (
              <>
                <div className="login-form-group">
                  <label htmlFor="email">Email (Optional)</label>
                  <div className="login-input-wrapper">
                    <FaEnvelope className="login-input-icon" />
                    <input 
                      type="email" 
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="login-form-group">
                  <label htmlFor="phone">Phone (Optional)</label>
                  <div className="login-input-wrapper">
                    <FaPhone className="login-input-icon" />
                    <input 
                      type="tel" 
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </>
            )}
            
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
                  {isRegistering ? <FaUserPlus /> : <FaSignInAlt />}
                  <span>{isRegistering ? 'Register' : 'Sign In'}</span>
                </>
              )}
            </motion.button>
          </form>
          
          <div className="login-footer">
            <button 
              className="login-switch-mode"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setFormData({
                  username: '',
                  password: '',
                  email: '',
                  phone: ''
                });
              }}
            >
              {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default LoginPage;
