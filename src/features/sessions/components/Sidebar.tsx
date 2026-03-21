import { m } from 'motion/react';
import { sidebar, sidebarContent, sectionHeading } from './Sidebar.css';

interface SidebarProps {
  open: boolean;
}

export function Sidebar({ open }: SidebarProps) {
  return (
    <m.div
      className={sidebar}
      data-testid="sidebar"
      animate={{
        width: open ? 320 : 0,
        opacity: open ? 1 : 0,
      }}
      transition={{
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1], // easing.out
      }}
      style={{ overflow: 'hidden' }}
    >
      <div className={sidebarContent}>
        <h3 className={sectionHeading}>Session Info</h3>
        <h3 className={sectionHeading}>Card List</h3>
        <h3 className={sectionHeading}>Notes</h3>
      </div>
    </m.div>
  );
}
