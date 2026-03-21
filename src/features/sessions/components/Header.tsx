import { type ReactNode } from 'react';
import { headerContainer, logoText, avatarPlaceholder } from './Header.css';

interface HeaderProps {
  /** Optional slot for session-specific header content (e.g., SessionHeader) */
  sessionHeader?: ReactNode;
}

export function Header({ sessionHeader }: HeaderProps) {
  return (
    <div className={headerContainer} data-testid="header">
      <span className={logoText}>The Helm</span>
      {sessionHeader}
      <div className={avatarPlaceholder}>U</div>
    </div>
  );
}
