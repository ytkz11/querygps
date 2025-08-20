# 经纬度查询工具

一个基于Web的经纬度查询工具，支持实时鼠标坐标显示和点击固定坐标功能。

## 功能特点

- 🗺️ **双地图支持**：高德地图和OpenStreetMap切换
- 📍 **实时坐标**：鼠标移动时实时显示坐标
- 📌 **固定坐标**：点击地图固定坐标位置
- 🔄 **坐标转换**：支持GCJ02、WGS84、BD09三种坐标系
- 🎨 **现代UI**：简洁美观的用户界面
- 📱 **响应式设计**：适配不同屏幕尺寸

## 在线演示

[点击查看在线演示](https://ytkz.tech/querygps/)

## 本地运行

1. 克隆项目
```bash
git clone https://github.com/your-username/lat-lon-query-tool.git
cd lat-lon-query-tool
```

2. 安装依赖
```bash
npm install
```

3. 启动服务器
```bash
npm start
```

4. 打开浏览器访问 `http://localhost:3000`

## GitHub Pages 部署

### 方法一：使用 GitHub Actions（推荐）

1. Fork 或克隆此仓库到你的 GitHub 账户
2. 在仓库设置中启用 GitHub Pages
3. 选择 "Deploy from a branch" 并选择 "gh-pages" 分支
4. 推送代码到 main 分支，GitHub Actions 会自动部署

### 方法二：手动部署

1. 在 GitHub 仓库设置中启用 GitHub Pages
2. 选择 "Deploy from a branch" 并选择 "main" 分支的 "/docs" 文件夹
3. 项目会自动部署 `docs` 目录中的静态文件

### 部署说明

- `docs` 目录包含了完整的静态网站文件
- 无需 Node.js 服务器，纯前端运行
- 支持 HTTPS 和自定义域名

## 项目结构

```
lat-lon-query-tool/
├── public/
│   ├── css/
│   │   └── style.css          # 样式文件
│   ├── js/
│   │   ├── app.js             # 主应用逻辑
│   │   └── coord-convert.js   # 坐标转换工具
│   ├── resources/
│   │   ├── icon.ico           # 网站图标
│   │   └── link.jpg           # 链接图片
│   └── index.html             # 主页面
├── server.js                  # Node.js 服务器
├── package.json               # 项目配置
└── README.md                  # 项目说明
```

## 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **地图库**：Leaflet.js
- **后端**：Node.js, Express.js
- **坐标系统**：GCJ02, WGS84, BD09

## 坐标系说明

- **GCJ02**：中国国家测绘局坐标系，高德地图、腾讯地图使用
- **WGS84**：世界大地测量系统，GPS原始坐标系
- **BD09**：百度坐标系，百度地图使用

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.0.0
- 初始版本发布
- 支持实时和固定坐标显示
- 支持三种坐标系转换
- 现代化UI设计