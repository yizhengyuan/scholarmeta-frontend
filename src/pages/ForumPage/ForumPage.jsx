import React, { useRef, useEffect, useState } from 'react';
import './ForumPage.css';
import ForumGrid from '../../components/ForumGrid';
import AOS from 'aos';
import 'aos/dist/aos.css';

function ForumPage() {
  const particlesRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // 只在初始加载时重置滚动位置
    if (isInitialLoad) {
      setIsInitialLoad(false);
      window.scrollTo(0, 0);
    } else {
      // 从 ForumDetail 返回时，恢复之前的滚动位置
      const savedScrollPosition = sessionStorage.getItem('forumScrollPosition');
      if (savedScrollPosition) {
        window.scrollTo(0, parseInt(savedScrollPosition));
        sessionStorage.removeItem('forumScrollPosition'); // 清除保存的位置
      }
    }
    
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });

    // 粒子动画效果
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
      sessionStorage.setItem('forumScrollPosition', window.scrollY.toString());
    };
  }, [isInitialLoad]);

  return (
    <div className="forum-root">
      <canvas ref={particlesRef} className="particles-bg"></canvas>
      
      <div className="forum-hero" data-aos="fade-down">
        <h1 className="forum-title">
          Community Forum
          <span className="forum-title-accent">Share & Discuss</span>
        </h1>
        <p className="forum-description">
          Join our vibrant community to discuss Web3, blockchain, and the future of technology
        </p>
        <div className="forum-stats">
          <div className="stat-item" data-aos="fade-up" data-aos-delay="100">
            <span className="stat-number">1.2K</span>
            <span className="stat-label">Members</span>
          </div>
          <div className="stat-item" data-aos="fade-up" data-aos-delay="200">
            <span className="stat-number">3.5K</span>
            <span className="stat-label">Posts</span>
          </div>
          <div className="stat-item" data-aos="fade-up" data-aos-delay="300">
            <span className="stat-number">12K</span>
            <span className="stat-label">Comments</span>
          </div>
        </div>
      </div>

      <div className="forum-content">
        <ForumGrid />
      </div>
    </div>
  );
}

export default ForumPage; 