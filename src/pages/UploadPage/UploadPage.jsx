import React, { useState, useContext, useRef, useEffect } from 'react';
import './UploadPage.css';
import { Web3Context } from '../../context/Web3Context';
import AOS from 'aos';
import { mediaAPI } from '../../router';
import { FaEdit, FaTimes, FaGlobe, FaLock } from 'react-icons/fa';

function UploadPage() {
  const { web3State } = useContext(Web3Context);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const particlesRef = useRef(null);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [uploadedSize, setUploadedSize] = useState(0);
  const lastUploadedRef = useRef(0);
  const uploadStartTimeRef = useRef(null);
  const [showTemplate, setShowTemplate] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    aiPrompt: '',
    visibility: 'public'
  });

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
    const selectedFiles = Array.from(e.target.files);
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const MAX_FILES = 5;

    if (files.length + selectedFiles.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    const validFiles = selectedFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File ${file.name} exceeds 50MB limit`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
    setError(null);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleTemplateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 格式化文件大小
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // 格式化速度
  const formatSpeed = (bytesPerSecond) => {
    return ` ${formatSize(bytesPerSecond)}/s`;
  };

  // 更新上传速度
  const updateSpeed = () => {
    if (!uploadStartTimeRef.current) return;
    
    const now = Date.now();
    const timeDiff = (now - uploadStartTimeRef.current) / 1000; // 转换为秒
    const bytesDiff = uploadedSize - lastUploadedRef.current;
    
    if (timeDiff > 0) {
      const speed = bytesDiff / timeDiff;
      setUploadSpeed(speed);
      lastUploadedRef.current = uploadedSize;
      uploadStartTimeRef.current = now;
    }
  };

  useEffect(() => {
    const speedInterval = setInterval(updateSpeed, 1000);
    return () => clearInterval(speedInterval);
  }, [uploadedSize]);

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("请选择至少一个文件");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    setUploadResult(null);
    setUploadedSize(0);
    setUploadSpeed(0);
    lastUploadedRef.current = 0;
    uploadStartTimeRef.current = Date.now();

    // 创建一个模拟进度的计时器
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 20; // 每秒增加20%，5秒到达100%
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 1000);

    try {
      // 保持原有的上传进度监听逻辑
      const onUploadProgress = (progressEvent) => {
        // 不再使用实际上传进度，而是使用模拟进度
        setUploadedSize(progressEvent.loaded);
      };

      // 准备帖子数据
      const postData = {
        title: formData.title || '',
        content: formData.content || '',
        summary: '', // 可以添加摘要字段
        tags: formData.tags || '',
        ai_instruction: formData.aiPrompt || '',
        visibility: formData.visibility || 'public'
      };

      // 使用新的 API 上传文件并创建论坛帖子
      // 创建一个Promise竞争，5秒后自动完成
      const uploadPromise = mediaAPI.createForumPost(
        files,
        postData,
        { onUploadProgress }
      );

      const timeoutPromise = new Promise(resolve => {
        setTimeout(() => {
          resolve({
            post_id: "pending",
            message: "Submission successful, post will be visible in about 1 minute",
            status: "processing"
          });
        }, 5000);
      });

      // 使用Promise.race，哪个先完成就用哪个结果
      const result = await Promise.race([uploadPromise, timeoutPromise]);

      // 清除进度条计时器
      clearInterval(progressInterval);
      setProgress(100);

      // 处理成功响应
      setUploadResult({
        postId: result.post_id,
        message: result.message || "Submission successful, post will be visible in about 1 minute",
        status: result.status,
        timestamp: new Date().toISOString()
      });
      
      setTimeout(() => {
        setFiles([]);
        setUploading(false);
        setProgress(0);
        setUploadedSize(0);
        setUploadSpeed(0);
        setFormData({
          title: '',
          content: '',
          tags: '',
          aiPrompt: '',
          visibility: 'public'
        });
      }, 1000);
      
    } catch (err) {
      console.error("文件上传失败:", err);
      setError(err.response?.data?.message || err.message || "上传失败");
      setUploading(false);
      setProgress(0);
      setUploadedSize(0);
      setUploadSpeed(0);
      // 清除进度条计时器
      clearInterval(progressInterval);
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
        <div className="upload-main">
          <div className="upload-card">
            <div className="upload-header">
              <span className="upload-header-icon">📤</span>
              <h2>Upload Your Files</h2>
            </div>
            
            <div className="upload-area">
              <input 
                type="file" 
                id="file-input" 
                onChange={handleFileChange}
                disabled={uploading}
                className="upload-input"
                multiple
              />
              <label 
                htmlFor="file-input" 
                className={`upload-label ${uploading ? 'disabled' : ''}`}
              >
                <div className="upload-placeholder">
                  <span className="upload-icon">📁</span>
                  <span>Choose files or drag them here</span>
                  <span className="upload-limits">Max 5 files, up to 50MB each</span>
                </div>
              </label>
            </div>

            {files.length > 0 && (
              <div className="uploaded-files-bar">
                <div className="uploaded-files-header">
                  <h3>Selected Files</h3>
                  <span className="file-count">{files.length} file(s)</span>
                </div>
                <div className="uploaded-files-list">
                  {files.map((file, index) => (
                    <div key={index} className="uploaded-file-item">
                      <div className="file-item-info">
                        <span className="file-item-icon">
                          {file.type.startsWith('image/') ? '🖼️' : 
                           file.type.startsWith('video/') ? '🎥' : 
                           file.type.startsWith('audio/') ? '🎵' : '📄'}
                        </span>
                        <div className="file-item-details">
                          <span className="file-item-name">{file.name}</span>
                          <span className="file-item-size">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                        </div>
                      </div>
                      <button 
                        className="file-item-remove"
                        onClick={() => removeFile(index)}
                        disabled={uploading}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button 
              className="metadata-toggle"
              onClick={() => setShowTemplate(!showTemplate)}
            >
              <FaEdit />
              <span>{showTemplate ? 'Hide Metadata' : 'Add Metadata'}</span>
            </button>

            {showTemplate && (
              <div className="metadata-form">
                <div className="metadata-group">
                  <label className="metadata-label">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleTemplateChange}
                    placeholder="Enter title"
                    className="metadata-input"
                  />
                </div>

                <div className="metadata-group">
                  <label className="metadata-label">Summary</label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleTemplateChange}
                    placeholder="Enter a brief summary"
                    className="metadata-textarea"
                  />
                </div>

                <div className="metadata-group">
                  <label className="metadata-label">Content</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleTemplateChange}
                    placeholder="Enter content"
                    className="metadata-textarea"
                  />
                </div>

                <div className="metadata-group">
                  <label className="metadata-label">Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleTemplateChange}
                    placeholder="Enter tags (comma separated)"
                    className="metadata-input"
                  />
                </div>

                <div className="metadata-group">
                  <label className="metadata-label">AI Instructions</label>
                  <textarea
                    name="aiPrompt"
                    value={formData.aiPrompt}
                    onChange={handleTemplateChange}
                    placeholder="Enter AI processing instructions"
                    className="metadata-textarea"
                  />
                </div>

                <div className="metadata-group">
                  <label className="metadata-label">Visibility</label>
                  <div className="visibility-options">
                    <label className="visibility-option">
                      <input
                        type="radio"
                        name="visibility"
                        value="public"
                        checked={formData.visibility === 'public'}
                        onChange={handleTemplateChange}
                      />
                      <FaGlobe />
                      <span>Public</span>
                    </label>
                    <label className="visibility-option">
                      <input
                        type="radio"
                        name="visibility"
                        value="private"
                        checked={formData.visibility === 'private'}
                        onChange={handleTemplateChange}
                      />
                      <FaLock />
                      <span>Private</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {files.length > 0 && !uploading && (
              <button 
                className="upload-button"
                onClick={handleUpload}
              >
                Upload Files
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
              </div>
            )}
          </div>

          {error && (
            <div className="upload-error">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
            </div>
          )}

          {uploadResult && (
            <div className="upload-success">
              <div className="success-header">
                <span className="success-icon">✨</span>
                <h3>Upload Successful!</h3>
              </div>
              
              <div className="success-details">
                <div className="detail-row">
                  <span className="detail-label">Status</span>
                  <span className="detail-value">{uploadResult.status}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Message</span>
                  <span className="detail-value">Submission successful, post will be visible in about 1 minute</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Timestamp</span>
                  <span className="detail-value">{uploadResult.timestamp}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadPage;
