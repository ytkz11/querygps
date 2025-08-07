/**
 * 经纬度查询工具 - Node.js 服务器
 * 提供Web界面服务
 */

const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const cors = require('cors');

const app = express();
let PORT = process.env.PORT || 3000;

// 检测是否在pkg打包环境中
const isPkg = typeof process.pkg !== 'undefined';
const publicPath = isPkg ? path.join(path.dirname(process.execPath), 'public') : path.join(__dirname, 'public');

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.static(publicPath));

/**
 * 主页路由
 */
app.get('/', (req, res) => {
    const indexPath = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('页面不存在');
    }
});

/**
 * 健康检查路由
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: '经纬度查询工具运行正常',
        timestamp: new Date().toISOString()
    });
});

/**
 * 错误处理中间件
 */
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        error: '服务器内部错误',
        message: err.message
    });
});

/**
 * 404处理
 */
app.use((req, res) => {
    res.status(404).json({
        error: '页面不存在',
        path: req.path
    });
});

/**
 * 启动服务器
 */
function startServer() {
    const server = app.listen(PORT, () => {
        console.log(`经纬度查询工具已启动`);
        console.log(`访问地址: http://localhost:${PORT}`);
        console.log(`静态文件目录: ${publicPath}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`端口 ${PORT} 已被占用，尝试使用端口 ${PORT + 1}`);
            PORT++;
            setTimeout(() => {
                server.close();
                startServer();
            }, 1000);
        } else {
            console.error('服务器启动失败:', err);
        }
    });
}

// 启动服务器
startServer();

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n正在关闭服务器...');
    process.exit(0);
});