# 🎭 演出日历系统

一个基于 Next.js 的演出日历管理系统，具有手绘蜡笔风格的用户界面。

## ✨ 功能特性

- 📅 **日历管理**: 显示、编辑日程安排
- 🏷️ **标签管理**: 自定义类型、地点、城市标签
- 🎨 **手绘风格**: 蜡笔质感线条设计
- 💾 **本地存储**: 浏览器端数据存储（LocalStorage）
- 📤 **数据导出**: 支持 CSV/JSON 格式导出
- 🖼️ **图片导出**: 生成日历图片（开发中）
- ⚙️ **个性化设置**: 字体选择、数据管理

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm 或 yarn

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 开发模式

```bash
npm run dev
# 或
yarn dev
```

访问 http://localhost:3000 查看应用。

### 生产构建

```bash
npm run build
npm start
```

## 📁 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── calendar/          # 日历页面
│   ├── export-data/       # 数据导出页面
│   ├── export-image/      # 图片导出页面
│   ├── settings/          # 设置页面
│   ├── tags/              # 标签编辑页面
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── Calendar/          # 日历相关组件
│   ├── ExportData.tsx     # 数据导出组件
│   ├── ExportImage.tsx    # 图片导出组件
│   ├── Menu.tsx           # 菜单导航
│   ├── Settings.tsx       # 设置组件
│   └── TagsEditor.tsx     # 标签编辑组件
├── fonts/                 # 字体文件
├── types/                 # TypeScript 类型定义
├── utils/                 # 工具函数
└── public/               # 静态资源
```

## 🎯 核心功能

### 日历模块
- 月视图显示
- 日期点击编辑
- 事件详情展示
- 彩色标签标识

### 标签管理
- 固定类型标签: Live、干饭、旅行、运动
- 自定义地点标签
- 自定义城市标签
- 颜色配置管理

### 数据管理
- 本地存储持久化
- 数据备份导出
- 一键清除数据

### 导出功能
- CSV 格式导出
- JSON 格式导出
- 日历图片生成

## 🎨 设计特色

- **手绘风格**: 所有边框采用蜡笔质感线条
- **黑白主色**: 简洁现代的视觉设计
- **响应式布局**: 支持桌面和移动设备
- **自定义字体**: 支持系统字体和自定义字体

## 🔧 技术栈

- **前端框架**: Next.js 14 (App Router)
- **样式方案**: Tailwind CSS
- **图标库**: Lucide React
- **日期处理**: date-fns
- **类型安全**: TypeScript
- **部署平台**: Vercel

## 📊 数据存储

系统使用浏览器本地存储（LocalStorage）保存以下数据：

```typescript
{
  events: { [date: string]: EventData },    // 事件数据
  tags: {                                  // 标签配置
    type: { [type: string]: string },       // 类型颜色
    place: string[],                        // 地点列表
    city: string[]                         // 城市列表
  },
  settings: {                              // 用户设置
    font: string,                          // 字体选择
    menuCollapsed: boolean                 // 菜单状态
  }
}
```

## 🚀 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量（如果需要）
4. 部署完成

### 其他平台

项目支持部署到任何支持 Node.js 的平台：
- Netlify
- Railway
- 自有服务器

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License