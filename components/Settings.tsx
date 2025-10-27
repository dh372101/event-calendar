'use client';

import { useState, useEffect } from 'react';
import { StorageUtil } from '@/utils/storage';
import { Settings } from '@/types';

export default function SettingsComponent() {
  const [settings, setSettings] = useState<Settings>({
    font: 'system',
    menuCollapsed: false,
    version: '1.0.0',
  });
  const [availableFonts, setAvailableFonts] = useState<Array<{ name: string; path: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 加载设置
  useEffect(() => {
    const loadedSettings = StorageUtil.getSettings();
    setSettings(loadedSettings);

    // 加载可用字体
    loadAvailableFonts();
  }, []);

  // 加载可用字体列表
  const loadAvailableFonts = async () => {
    try {
      // 这里应该从API获取字体列表，现在先用模拟数据
      const fonts = [
        { name: '系统默认', path: 'system' },
        { name: '手写风格', path: '/fonts/handwritten.ttf' },
        { name: '圆润字体', path: '/fonts/rounded.woff2' },
        { name: '艺术字体', path: '/fonts/artistic.otf' },
      ];
      setAvailableFonts(fonts);
    } catch (error) {
      console.error('加载字体列表失败:', error);
    }
  };

  // 保存设置
  const saveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    StorageUtil.saveSettings(newSettings);
    applyFont(newSettings.font);
  };

  // 应用字体
  const applyFont = (fontPath: string) => {
    if (fontPath === 'system') {
      document.documentElement.style.setProperty('--font-family', 'system-ui, -apple-system, sans-serif');
    } else {
      // 创建@font-face
      const styleId = 'custom-font-style';
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;

      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }

      const fontName = `CustomFont${Date.now()}`;
      styleElement.textContent = `
        @font-face {
          font-family: '${fontName}';
          src: url('${fontPath}') format('truetype');
        }
      `;

      document.documentElement.style.setProperty('--font-family', `'${fontName}', system-ui, sans-serif`);
    }
  };

  // 处理字体选择
  const handleFontChange = (fontPath: string) => {
    saveSettings({
      ...settings,
      font: fontPath,
    });
  };

  // 处理菜单折叠设置
  const handleMenuCollapsedChange = (collapsed: boolean) => {
    saveSettings({
      ...settings,
      menuCollapsed: collapsed,
    });
  };

  // 清除所有数据
  const handleClearData = () => {
    const confirmText = `确定要清除所有数据吗？此操作将删除：
- 所有事件记录
- 标签配置
- 用户设置

此操作不可撤销！`;

    if (confirm(confirmText)) {
      StorageUtil.clearAll();
      // 重新加载页面以重置状态
      window.location.reload();
    }
  };

  // 导出数据备份
  const handleExportBackup = () => {
    const backupData = StorageUtil.exportData();
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `演出日历备份_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  // 导入数据备份
  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      if (backupData.events || backupData.tags || backupData.settings) {
        const success = StorageUtil.importData(backupData);
        if (success) {
          alert('数据导入成功！页面将刷新以应用新设置。');
          window.location.reload();
        } else {
          alert('数据导入失败，请检查文件格式。');
        }
      } else {
        alert('无效的备份文件格式。');
      }
    } catch (error) {
      console.error('导入备份失败:', error);
      alert('导入备份失败，请检查文件格式。');
    } finally {
      setIsLoading(false);
      // 清空文件输入
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">设置</h1>
        <p className="text-gray-600">
          配置字体偏好、管理数据和查看系统信息
        </p>
      </div>

      {/* 字体设置 */}
      <div className="bg-white rounded-lg crayon-border p-6">
        <h2 className="text-xl font-bold mb-4">字体设置</h2>
        <p className="text-sm text-gray-600 mb-4">
          选择您喜欢的字体风格来个性化界面显示
        </p>

        <div className="space-y-3">
          {availableFonts.map((font) => (
            <label
              key={font.path}
              className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-black transition-colors"
            >
              <input
                type="radio"
                name="font"
                value={font.path}
                checked={settings.font === font.path}
                onChange={() => handleFontChange(font.path)}
                className="mr-3"
              />
              <div>
                <div className="font-medium">{font.name}</div>
                <div className="text-sm text-gray-600">{font.path}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            💡 提示：字体文件需要放在 `/fonts` 目录下。支持的格式包括 TTF、WOFF、WOFF2、OTF。
          </p>
        </div>
      </div>

      {/* 界面设置 */}
      <div className="bg-white rounded-lg crayon-border p-6">
        <h2 className="text-xl font-bold mb-4">界面设置</h2>

        <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-black transition-colors">
          <input
            type="checkbox"
            checked={settings.menuCollapsed}
            onChange={(e) => handleMenuCollapsedChange(e.target.checked)}
            className="mr-3"
          />
          <div>
            <div className="font-medium">默认折叠菜单</div>
            <div className="text-sm text-gray-600">
              在桌面端默认折叠左侧导航菜单
            </div>
          </div>
        </label>
      </div>

      {/* 数据管理 */}
      <div className="bg-white rounded-lg crayon-border p-6">
        <h2 className="text-xl font-bold mb-4">数据管理</h2>

        <div className="space-y-4">
          {/* 备份数据 */}
          <div>
            <h3 className="font-medium mb-2">数据备份</h3>
            <p className="text-sm text-gray-600 mb-3">
              导出完整的备份数据，包含所有事件、标签和设置
            </p>
            <button
              onClick={handleExportBackup}
              className="btn"
            >
              导出备份
            </button>
          </div>

          {/* 恢复数据 */}
          <div>
            <h3 className="font-medium mb-2">恢复备份</h3>
            <p className="text-sm text-gray-600 mb-3">
              从备份文件恢复数据（将覆盖当前数据）
            </p>
            <label className="btn cursor-pointer">
              {isLoading ? '恢复中...' : '选择备份文件'}
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
                disabled={isLoading}
              />
            </label>
          </div>

          {/* 清除数据 */}
          <div>
            <h3 className="font-medium mb-2 text-red-600">危险操作</h3>
            <p className="text-sm text-gray-600 mb-3">
              清除所有数据，恢复到初始状态
            </p>
            <button
              onClick={handleClearData}
              className="btn bg-red-600 text-white hover:bg-red-700 border-red-600"
            >
              清除所有数据
            </button>
          </div>
        </div>
      </div>

      {/* 系统信息 */}
      <div className="bg-white rounded-lg crayon-border p-6">
        <h2 className="text-xl font-bold mb-4">系统信息</h2>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">版本号：</span>
            <span className="font-medium">{settings.version}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">当前字体：</span>
            <span className="font-medium">
              {availableFonts.find(f => f.path === settings.font)?.name || settings.font}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">存储类型：</span>
            <span className="font-medium">浏览器本地存储</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">最后更新：</span>
            <span className="font-medium">
              {new Date().toLocaleDateString('zh-CN')}
            </span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>关于：</strong>演出日历系统 v1.0.0<br/>
            一个简洁的个人演出活动管理工具，支持手绘风格界面和本地数据存储。
          </p>
        </div>
      </div>
    </div>
  );
}