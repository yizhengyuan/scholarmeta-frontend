import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaFileUpload, FaRobot, FaCoins, FaUsers, FaComments, FaGraduationCap } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './HomePage.css';

function HomePage() {
  const particlesRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const placeholderRef = useRef("Search academic topics, tags, or authors");

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to forum page with search parameter
      navigate(`/forum?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });

    // Particle animation effect
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
    
    const init = () => {
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Add connection lines effect
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
      
      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      requestAnimationFrame(animate);
    };
    
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="sm-home-page">
      <canvas ref={particlesRef} className="sm-particles-bg"></canvas>
      
      <section className="sm-hero-section">
        <div className="sm-hero-content" data-aos="fade-up">
          <h1 className="sm-main-title">ScholarMeta</h1>
          <p className="sm-tagline">Connecting Academic Thoughts, Tokenizing Research Insights</p>
          <div className="sm-slogan-container">
            <div className="sm-slogan" data-aos="fade-up" data-aos-delay="100">
              Science Without Boundaries, Value Unlocked
            </div>
            <div className="sm-slogan" data-aos="fade-up" data-aos-delay="200">
              Share, Like, Earn, Repeat
            </div>
          </div>
          
          {/* Redesigned search box */}
          <form className="sm-search-container" onSubmit={handleSearchSubmit} data-aos="fade-up" data-aos-delay="300">
            <div className="sm-search-box">
              <FaSearch className="sm-search-icon" />
              <div className="sm-search-input-wrapper">
                {!searchTerm && !isFocused && (
                  <div className="sm-search-placeholder">
                    <span>{placeholderRef.current}</span>
                    <span className="sm-search-cursor"></span>
                  </div>
                )}
                <input 
                  type="text" 
                  placeholder=""
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="sm-search-input"
                />
              </div>
              <button type="submit" className="sm-search-btn">
                Explore
              </button>
            </div>
          </form>
          
        </div>
      </section>

      <section className="sm-about-section">
        <div className="sm-about-content" data-aos="fade-right">
          <h2 className="sm-section-title">About ScholarMeta</h2>
          <p className="sm-about-text">
            ScholarMeta is a revolutionary academic exchange platform that combines traditional research with Web3 technology. We are committed to creating a decentralized scientific discovery ecosystem where researchers can safely share, discuss, and receive value rewards for their contributions.
          </p>
          <p className="sm-about-text">
            At ScholarMeta, "Scholar" represents academic research, experiments, discoveries, and the global researcher community; "Meta" symbolizes the metadata layer that transcends tradition, connecting scientific knowledge with value networks.
          </p>
          <p className="sm-about-text">
            Our platform provides:
          </p>
          <ul className="sm-about-list">
            <li>Networked interaction, collaboration, and contribution space between researchers</li>
            <li>Token-based reward ecosystem where valuable contributions (ideas, experiment videos, insights) are validated and incentivized</li>
            <li>AI-driven content analysis to improve research efficiency and discovery capabilities</li>
          </ul>
        </div>
        <div className="sm-about-image" data-aos="fade-left">
          <div className="sm-image-placeholder">
            <FaGraduationCap className="sm-placeholder-icon" />
          </div>
        </div>
      </section>

      <section className="sm-features-section">
        <h2 className="sm-section-title" data-aos="fade-up">Platform Features</h2>
        <div className="sm-features-grid">
          <div className="sm-feature-card" data-aos="fade-up" data-aos-delay="100">
            <div className="sm-feature-icon">
              <FaCoins />
            </div>
            <h3>Token Reward Mechanism</h3>
            <p>Earn token rewards by uploading high-quality research materials, incentivizing knowledge sharing and innovation</p>
          </div>
          
          <div className="sm-feature-card" data-aos="fade-up" data-aos-delay="200">
            <div className="sm-feature-icon">
              <FaRobot />
            </div>
            <h3>AI Content Generation</h3>
            <p>Artificial intelligence automatically parses research files, generates discussion topics, and improves research efficiency</p>
          </div>
          
          <div className="sm-feature-card" data-aos="fade-up" data-aos-delay="300">
            <div className="sm-feature-icon">
              <FaUsers />
            </div>
            <h3>Academic Community</h3>
            <p>Connect global researchers, promoting interdisciplinary exchange and collaboration</p>
          </div>
          
          <div className="sm-feature-card" data-aos="fade-up" data-aos-delay="400">
            <div className="sm-feature-icon">
              <FaComments />
            </div>
            <h3>Open Discussion</h3>
            <p>Open and transparent research discussion environment, promoting peer review and knowledge validation</p>
          </div>
        </div>
      </section>

      <section className="sm-stats-section" data-aos="fade-up">
        <div className="sm-stat-item">
          <span className="sm-stat-number">10K+</span>
          <span className="sm-stat-label">Researchers</span>
        </div>
        <div className="sm-stat-item">
          <span className="sm-stat-number">5K+</span>
          <span className="sm-stat-label">Research Outputs</span>
        </div>
        <div className="sm-stat-item">
          <span className="sm-stat-number">25K+</span>
          <span className="sm-stat-label">Discussions</span>
        </div>
        <div className="sm-stat-item">
          <span className="sm-stat-number">100K+</span>
          <span className="sm-stat-label">Tokens Distributed</span>
        </div>
      </section>

      <section className="sm-cta-section" data-aos="zoom-in">
        <h2 className="sm-cta-title">Join the Future of Academic Innovation</h2>
        <p className="sm-cta-text">Upload your research, participate in discussions, earn token rewards</p>
        <Link to="/register" className="sm-cta-button">Register Now</Link>
      </section>
    </div>
  );
}

export default HomePage;