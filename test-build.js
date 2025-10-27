// 简单的构建测试脚本
const { execSync } = require('child_process');

try {
  console.log('🔍 检查 TypeScript 类型...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript 类型检查通过');

  console.log('🏗️ 开始构建项目...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ 构建成功！');
} catch (error) {
  console.error('❌ 构建失败：', error.message);
  process.exit(1);
}