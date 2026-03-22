import { m } from 'motion/react';
import { panelSlide } from '@/common/animations';
import { sidebar, sidebarContent, sectionHeading } from './Sidebar.css';

interface SidebarProps {
  open: boolean;
}

export function Sidebar({ open }: SidebarProps) {
  return (
    <m.aside
      className={sidebar}
      data-testid="sidebar"
      data-state={open ? 'open' : 'closed'}
      variants={panelSlide.variants}
      initial={false}
      animate={open ? 'visible' : 'hidden'}
      transition={{ ...panelSlide.transition, duration: 0.2 }}
    >
      <div className={sidebarContent}>
        <h3 className={sectionHeading}>Session Info</h3>
        <h3 className={sectionHeading}>Card List</h3>
        <h3 className={sectionHeading}>Notes</h3>
      </div>
    </m.aside>
  );
}
