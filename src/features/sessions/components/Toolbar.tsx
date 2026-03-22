import { IconButton, Icon } from '@/common/components';
import { toolbarContainer, inputPlaceholder } from './Toolbar.css';

interface ToolbarProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export function Toolbar({ onToggleSidebar, sidebarOpen }: ToolbarProps) {
  return (
    <div className={toolbarContainer} data-testid="toolbar">
      <span className={inputPlaceholder}>Input surface placeholder</span>
      <IconButton
        icon={<Icon name="menu" size={20} />}
        variant="ghost"
        color="neutral"
        size="sm"
        onClick={onToggleSidebar}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      />
    </div>
  );
}
