'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { StorageUtil } from '@/utils/storage';
import { Settings } from '@/types';

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: string;
}

export default function Menu() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    { id: 'calendar', label: '日历', path: '/calendar', icon: '📅' },
    { id: 'tags', label: '标签编辑', path: '/tags', icon: '🏷️' },
    { id: 'export-image', label: '导出图片', path: '/export-image', icon: '🖼️' },
    { id: 'export-data', label: '导出数据', path: '/export-data', icon: '📊' },
    { id: 'settings', label: '设置', path: '/settings', icon: '⚙️' },
  ];

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 加载折叠状态
  useEffect(() => {
    if (!isMobile) {
      const settings = StorageUtil.getSettings();
      setIsCollapsed(settings.menuCollapsed);
    }
  }, [isMobile]);

  // 保存折叠状态
  const handleToggleCollapse = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      const newCollapsed = !isCollapsed;
      setIsCollapsed(newCollapsed);

      const settings = StorageUtil.getSettings();
      StorageUtil.saveSettings({
        ...settings,
        menuCollapsed: newCollapsed,
      });
    }
  };

  // 菜单项点击处理
  const handleMenuClick = (path: string) => {
    router.push(path);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // 获取当前激活项
  const getActiveItem = () => {
    return menuItems.find(item => pathname === item.path);
  };

  const activeItem = getActiveItem();

  if (isMobile) {
    return (
      <>
        {/* 移动端菜单按钮 */}
        <button
          onClick={handleToggleCollapse}
          className="fixed top-4 left-4 z-50 p-3 bg-white border-2 border-black rounded-lg shadow-md hover:bg-black hover:text-white transition-colors md:hidden"
          aria-label="切换菜单"
        >
          <div className="w-5 h-5 flex flex-col justify-center space-y-1">
            <div className={`h-0.5 bg-current transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
            <div className={`h-0.5 bg-current transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
            <div className={`h-0.5 bg-current transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
          </div>
        </button>

        {/* 移动端菜单覆盖层 */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* 移动端菜单 */}
        <div className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r-2 border-black transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-4 border-b-2 border-black">
            <h2 className="text-lg font-bold">📅 演出日历</h2>
          </div>
          <nav className="p-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.path)}
                className={`w-full text-left p-3 mb-2 rounded-lg border-2 transition-all ${
                  activeItem?.id === item.id
                    ? 'bg-black text-white border-black'
                    : 'border-gray-300 hover:border-black hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </>
    );
  }

  // 桌面端菜单
  return (
    <div className={`h-screen bg-white border-r-2 border-black transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* 菜单头部 */}
      <div className="p-4 border-b-2 border-black flex items-center justify-between">
        {!isCollapsed && <h2 className="text-lg font-bold">📅 演出日历</h2>}
        <button
          onClick={handleToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={isCollapsed ? '展开菜单' : '折叠菜单'}
        >
          <div className="w-5 h-5 flex flex-col justify-center space-y-1">
            <div className={`h-0.5 bg-black transition-transform ${isCollapsed ? 'rotate-45 translate-y-1.5' : ''}`}></div>
            <div className={`h-0.5 bg-black transition-opacity ${isCollapsed ? 'opacity-0' : ''}`}></div>
            <div className={`h-0.5 bg-black transition-transform ${isCollapsed ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
          </div>
        </button>
      </div>

      {/* 菜单项 */}
      <nav className="p-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.path)}
            className={`w-full text-left p-3 mb-2 rounded-lg border-2 transition-all crayon-texture ${
              activeItem?.id === item.id
                ? 'bg-black text-white border-black'
                : 'border-gray-300 hover:border-black hover:bg-gray-50'
            }`}
            title={isCollapsed ? item.label : undefined}
          >
            <span className="text-lg">{item.icon}</span>
            {!isCollapsed && <span className="ml-2">{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}