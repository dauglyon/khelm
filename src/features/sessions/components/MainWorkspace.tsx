import { type ReactNode } from 'react';
import { main } from './WorkspaceLayout.css';

interface MainWorkspaceProps {
  children?: ReactNode;
}

export function MainWorkspace({ children }: MainWorkspaceProps) {
  return (
    <div className={main} data-testid="main-workspace">
      {children}
    </div>
  );
}
