# 演出日历系统 - 项目结构

## 根目录文件

- `package.json` - 项目配置和依赖
- `next.config.js` - Next.js 配置
- `tsconfig.json` - TypeScript 配置
- `.gitignore` - Git 忽略文件
- `README.md` - 项目说明文档
- `PROJECT_STRUCTURE.md` - 本文件

## 目录结构

```
ec-cc/
├── app/                          # Next.js App Router
│   ├── calendar/
│   │   └── page.tsx             # 日历页面
│   ├── tags/
│   │   └── page.tsx             # 标签编辑页面
│   ├── export-image/
│   │   └── page.tsx             # 导出图片页面
│   ├── export-data/
│   │   └── page.tsx             # 导出数据页面
│   ├── settings/
│   │   └── page.tsx             # 设置页面
│   ├── layout.tsx               # 根布局
│   └── page.tsx                 # 首页（重定向到日历）
├── components/                   # React 组件
│   ├── Menu.tsx                 # 响应式菜单组件
│   ├── Calendar/
│   │   ├── CalendarView.tsx     # 日历视图组件
│   │   ├── EventDetail.tsx      # 事件详情组件
│   │   └── EditModal.tsx        # 编辑弹窗组件
│   ├── TagsEditor.tsx           # 标签编辑器
│   ├── ExportImage.tsx          # 导出图片组件
│   ├── ExportData.tsx           # 导出数据组件
│   └── Settings.tsx             # 设置组件
├── public/                      # 静态资源
│   ├── styles/
│   │   ├── globals.css          # 全局样式
│   │   └── handdrawn.css        # 手绘风格样式
│   └── fonts/
│       └── README.md            # 字体使用说明
├── utils/                       # 工具函数
│   ├── storage.ts               # 本地存储工具
│   └── date.ts                  # 日期处理工具
├── types/                       # TypeScript 类型
│   └── index.ts                 # 类型定义
└── scripts/                     # 开发脚本
    ├── dev.bat                  # 开发启动脚本
    └── build.bat                # 构建脚本
```

## 功能模块说明

### 1. 菜单导航模块 (components/Menu.tsx)
- 响应式侧边栏设计
- 支持桌面端折叠和移动端汉堡菜单
- 当前页面高亮显示

### 2. 日历模块 (components/Calendar/)
- CalendarView: 月历视图，支持事件显示
- EventDetail: 事件详情列表
- EditModal: 事件添加/编辑弹窗

### 3. 标签编辑模块 (components/TagsEditor.tsx)
- 事件类型颜色管理
- 地点标签增删
- 城市标签增删

### 4. 导出功能模块
- ExportImage: 导出日历为PNG图片
- ExportData: 导入/导出CSV和JSON数据

### 5. 设置模块 (components/Settings.tsx)
- 字体选择和切换
- 界面偏好设置
- 数据备份和恢复
- 系统信息查看

## 技术实现

### 前端技术栈
- Next.js 15 (App Router)
- React 18 + TypeScript
- CSS-in-JS + 自定义CSS
- html2canvas (图片导出)
- papaparse (CSV处理)

### 数据存储
- 浏览器 LocalStorage
- 完全本地化，无服务器依赖
- 支持数据导入导出

### 设计风格
- 手绘蜡笔线条风格
- 响应式设计
- 微动画效果
- 支持自定义字体

## 部署说明

### 开发环境
```bash
npm install
npm run dev
```

### 生产构建
```bash
npm run build
npm start
```

### 推荐部署平台
- Vercel (最佳兼容性)
- Netlify
- 任何支持 Node.js 的平台

## 特色功能

1. **完全本地化**: 所有数据存储在浏览器本地，保护隐私
2. **手绘风格**: 独特的视觉设计，区别于传统日历应用
3. **灵活导出**: 支持图片、CSV、JSON多种导出格式
4. **响应式设计**: 完美适配桌面和移动设备
5. **个性化**: 支持字体切换和界面偏好设置

项目已完成全部核心功能开发，可以直接使用！