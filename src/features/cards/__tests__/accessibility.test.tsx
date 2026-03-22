import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusIndicator } from '../StatusIndicator';
import { CardHeader } from '../CardHeader';
import { SqlBody } from '../bodies/SqlBody';
import { vi } from 'vitest';

describe('Card Accessibility', () => {
  describe('StatusIndicator', () => {
    it('has aria-label for all statuses', () => {
      const statuses = ['thinking', 'running', 'complete', 'error'] as const;
      for (const status of statuses) {
        const { unmount } = render(<StatusIndicator status={status} />);
        expect(screen.getByLabelText(`Status: ${status}`)).toBeInTheDocument();
        unmount();
      }
    });

    it('has role=status', () => {
      render(<StatusIndicator status="thinking" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('CardHeader', () => {
    const defaultProps = {
      cardId: 'card-1',
      shortname: 'Test',
      type: 'sql' as const,
      status: 'complete' as const,
      onShortnameChange: vi.fn(),
      onOpenChat: vi.fn(),
      onCopy: vi.fn(),
      onPin: vi.fn(),
      onDelete: vi.fn(),
    };

    it('has aria-labels on action buttons', () => {
      render(<CardHeader {...defaultProps} />);
      expect(screen.getByLabelText('Open chat')).toBeInTheDocument();
      expect(screen.getByLabelText('Copy card')).toBeInTheDocument();
      expect(screen.getByLabelText('Pin card')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete card')).toBeInTheDocument();
    });

    it('uses button elements for interactive elements', () => {
      render(<CardHeader {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('SqlBody table accessibility', () => {
    it('uses semantic table elements', () => {
      render(
        <SqlBody
          content={{ query: 'SELECT 1', dataSource: 'test' }}
          result={{
            columns: [{ name: 'id', type: 'string' }],
            rows: [{ id: '1' }],
            rowCount: 1,
            truncated: false,
          }}
          status="complete"
        />
      );
      expect(screen.getByRole('table')).toBeInTheDocument();
      // Check for th elements with scope
      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBe(1);
    });
  });
});
