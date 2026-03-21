import { type ReactNode, useEffect } from 'react';
import { shell, header as headerStyle, toolbar as toolbarStyle, content } from './WorkspaceLayout.css';
import { Header } from './Header';
import { Toolbar } from './Toolbar';
import { MainWorkspace } from './MainWorkspace';
import { Sidebar } from './Sidebar';
import { useLayoutStore } from '@/common/stores/layoutStore';
import { useMediaQuery } from '@/common/hooks/useMediaQuery';
import { LazyMotionProvider } from '@/common/animations/LazyMotionProvider';

interface WorkspaceLayoutProps {
  children?: ReactNode;
  sessionHeader?: ReactNode;
}

export function WorkspaceLayout({
  children,
  sessionHeader,
}: WorkspaceLayoutProps) {
  const sidebarOpen = useLayoutStore((s) => s.sidebarOpen);
  const toggleSidebar = useLayoutStore((s) => s.toggleSidebar);
  const setSidebarOpen = useLayoutStore((s) => s.setSidebarOpen);
  const isNarrow = useMediaQuery('(max-width: 1023px)');

  useEffect(() => {
    if (isNarrow) {
      setSidebarOpen(false);
    }
  }, [isNarrow, setSidebarOpen]);

  return (
    <LazyMotionProvider>
      <div className={shell}>
        <div className={headerStyle}>
          <Header sessionHeader={sessionHeader} />
        </div>
        <div className={toolbarStyle}>
          <Toolbar onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        </div>
        <div className={content}>
          <MainWorkspace>{children}</MainWorkspace>
          <Sidebar open={sidebarOpen} />
        </div>
      </div>
    </LazyMotionProvider>
  );
}
