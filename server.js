const express = require('express');
const path = require('path');
const app = express();

// 设置静态文件目录
app.use(express.static('dist'));

// 简化路由处理
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 捕获所有其他路由
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});