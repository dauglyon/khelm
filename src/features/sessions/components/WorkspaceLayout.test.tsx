import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { WorkspaceLayout } from './WorkspaceLayout';
import { useLayoutStore } from '@/common/stores/layoutStore';

describe('WorkspaceLayout', () => {
  beforeEach(() => {
    useLayoutStore.setState({ sidebarOpen: true });
  });

  it('renders the header region', () => {
    render(<WorkspaceLayout>Content</WorkspaceLayout>);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders the toolbar region', () => {
    render(<WorkspaceLayout>Content</WorkspaceLayout>);
    expect(screen.getByTestId('toolbar')).toBeInTheDocument();
  });

  it('renders the main workspace region', () => {
    render(<WorkspaceLayout>Content</WorkspaceLayout>);
    expect(screen.getByTestId('main-workspace')).toBeInTheDocument();
  });

  it('renders children inside the main workspace', () => {
    render(
      <WorkspaceLayout>
        <div data-testid="child-content">Test Child</div>
      </WorkspaceLayout>
    );
    const mainWorkspace = screen.getByTestId('main-workspace');
    expect(mainWorkspace).toContainElement(screen.getByTestId('child-content'));
  });

  it('renders the header with app logo text', () => {
    render(<WorkspaceLayout>Content</WorkspaceLayout>);
    expect(screen.getByText('The Helm')).toBeInTheDocument();
  });

  it('renders toolbar input placeholder', () => {
    render(<WorkspaceLayout>Content</WorkspaceLayout>);
    expect(screen.getByText('Input surface placeholder')).toBeInTheDocument();
  });

  describe('sidebar integration', () => {
    it('renders sidebar inside layout', () => {
      render(<WorkspaceLayout>Content</WorkspaceLayout>);
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('sidebar has open state when store is open', () => {
      useLayoutStore.setState({ sidebarOpen: true });
      render(<WorkspaceLayout>Content</WorkspaceLayout>);
      expect(screen.getByTestId('sidebar')).toHaveAttribute('data-state', 'open');
    });

    it('sidebar has closed state when store is closed', () => {
      useLayoutStore.setState({ sidebarOpen: false });
      render(<WorkspaceLayout>Content</WorkspaceLayout>);
      expect(screen.getByTestId('sidebar')).toHaveAttribute('data-state', 'closed');
    });

    it('toggling sidebar state changes data-state attribute', () => {
      useLayoutStore.setState({ sidebarOpen: true });
      render(<WorkspaceLayout>Content</WorkspaceLayout>);
      expect(screen.getByTestId('sidebar')).toHaveAttribute('data-state', 'open');

      act(() => {
        useLayoutStore.getState().toggleSidebar();
      });

      expect(screen.getByTestId('sidebar')).toHaveAttribute('data-state', 'closed');
    });
  });
});
