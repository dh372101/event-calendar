@echo off
echo 🏗️ 构建演出日历系统生产版本
echo.
echo 正在清理缓存...
rmdir /s /q .next 2>nul
echo.
echo 正在安装依赖...
npm install
echo.
echo 正在构建项目...
npm run build
echo.
echo 构建完成！输出目录：.next
echo.
echo 启动预览服务器...
npm start
pause