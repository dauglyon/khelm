import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WorkspaceLayout } from './WorkspaceLayout';

describe('WorkspaceLayout', () => {
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
});
