import React, { useState, useContext } from 'react';
import './UploadPage.css';
import { Web3Context } from '../../context/Web3Context';

function UploadPage() {
  const { web3State } = useContext(Web3Context);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("请先选择文件");
      return;
    }

    if (!web3State.connected) {
      setError("请先连接钱包");
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
    <div className="upload-page">
      <h1>文件上传</h1>
      
      {!web3State.connected && (
        <div className="connect-prompt">
          <p>请先连接您的钱包以上传文件</p>
        </div>
      )}
      
      <div className="upload-section">
        <h2>上传文件到IPFS</h2>
        <p>支持的文件类型：图片、文档、视频等</p>
        
        <div className="file-upload-container">
          <div className="file-input-container">
            <input 
              type="file" 
              id="file-input" 
              onChange={handleFileChange}
              disabled={uploading}
            />
            <label htmlFor="file-input" className={uploading ? "disabled" : ""}>
              {file ? "更改文件" : "选择文件"}
            </label>
            {file && <span className="file-name">{file.name}</span>}
          </div>
          
          {file && !uploading && (
            <button 
              className="upload-button"
              onClick={handleUpload}
              disabled={!web3State.connected}
            >
              上传到IPFS
            </button>
          )}
          
          {uploading && (
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              <span className="progress-text">{progress}%</span>
            </div>
          )}
          
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
      
      {uploadResult && (
        <div className="upload-result">
          <h3>上传成功！</h3>
          <div className="result-details">
            <p><strong>文件名：</strong> {uploadResult.fileName}</p>
            <p><strong>文件大小：</strong> {Math.round(uploadResult.fileSize / 1024)} KB</p>
            <p><strong>文件类型：</strong> {uploadResult.fileType}</p>
            <p><strong>IPFS哈希：</strong> <span className="ipfs-hash">{uploadResult.ipfsHash}</span></p>
            <p><strong>上传时间：</strong> {new Date(uploadResult.timestamp).toLocaleString()}</p>
          </div>
          <div className="ipfs-link">
            <a 
              href={`https://ipfs.io/ipfs/${uploadResult.ipfsHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              在IPFS上查看
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadPage;
