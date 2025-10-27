# 演出日历系统

一个手绘蜡笔风格的事件日历管理系统，基于 Next.js 构建。

## 功能特性

- 🎨 **手绘蜡笔风格** - 独特的黑白手绘UI设计
- 📅 **智能日历** - 支持事件添加、编辑、删除
- 🏷️ **标签管理** - 类型、地点、城市标签自定义
- 📤 **数据导出** - 支持图片、CSV、JSON格式导出
- 📥 **数据导入** - 支持CSV/JSON格式导入
- ⚙️ **个性化设置** - 字体切换、数据管理
- 📱 **响应式设计** - 完美适配桌面和移动端

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS + 自定义手绘样式
- **图标**: Lucide React
- **日期处理**: date-fns
- **图片生成**: html2canvas
- **部署**: Vercel

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
event-calendar/
├── app/                    # Next.js App Router
│   ├── api/               # Serverless API接口
│   │   ├── exportImage/   # 图片导出API
│   │   ├── exportData/    # 数据导出API
│   │   └── importData/    # 数据导入API
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页
├── components/            # React组件
│   ├── Calendar/          # 日历相关组件
│   │   ├── index.tsx     # 日历主组件
│   │   ├── CalendarView.tsx # 日历视图
│   │   ├── EventDetail.tsx  # 事件详情
│   │   └── EditModal.tsx  # 编辑弹窗
│   ├── Menu.tsx           # 菜单导航
│   ├── TagsEditor.tsx     # 标签编辑
│   ├── ExportImage.tsx    # 导出图片
│   ├── ExportData.tsx     # 导出数据
│   └── Settings.tsx       # 设置
├── types/                 # TypeScript类型定义
│   └── event.ts          # 事件数据类型
└── public/               # 静态资源
    └── fonts/            # 字体文件
```

## 数据存储

系统使用浏览器本地存储(LocalStorage)保存数据：

- `events` - 事件数据
- `tags` - 标签配置
- `settings` - 用户设置

## API接口

### 导出图片
- **路径**: `/api/exportImage`
- **方法**: POST
- **参数**: `{ startMonth, endMonth }`

### 导出数据
- **路径**: `/api/exportData`
- **方法**: POST
- **参数**: `{ format, startMonth, endMonth, events }`

### 导入数据
- **路径**: `/api/importData`
- **方法**: POST
- **参数**: 文件上传 (multipart/form-data)

## 部署

### Vercel部署

1. 将代码推送到GitHub仓库
2. 在Vercel中导入项目
3. 配置环境变量（如有需要）
4. 部署完成

### 其他平台

项目支持部署到任何支持Node.js的平台：

```bash
npm run build
```

## 开发说明

### 添加新字体

1. 将字体文件放入 `public/fonts/` 目录
2. 在 `app/globals.css` 中添加 `@font-face` 定义
3. 在 `components/Settings.tsx` 的 `availableFonts` 数组中添加新字体

### 自定义样式

系统使用Tailwind CSS + 自定义类名：

- `.crayon-border` - 手绘边框样式
- `.crayon-border-thin` - 细手绘边框
- `.menu-item-active` - 激活菜单项样式
- `.calendar-date` - 日历日期样式

## 许可证

MIT License

## 版本历史

- v1.0.0 - 初始版本，实现基础功能