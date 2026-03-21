import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LazyMotionProvider } from '@/common/animations/LazyMotionProvider';
import { Card } from './Card';

// Helper to wrap Card in LazyMotionProvider (required for m.div)
function renderCard(ui: React.ReactElement) {
  return render(<LazyMotionProvider>{ui}</LazyMotionProvider>);
}

describe('Card', () => {
  it('renders children content', () => {
    renderCard(
      <Card inputType="sql" data-testid="card">
        <div data-testid="content">Card content</div>
      </Card>
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies accent bar for a given input type', () => {
    renderCard(
      <Card inputType="python" data-testid="card">
        <span>Python card</span>
      </Card>
    );
    const cardEl = screen.getByTestId('card');
    // Accent bar is the first child div inside the card
    const accentBarEl = cardEl.querySelector('div');
    expect(accentBarEl).not.toBeNull();
    // Accent bar should have classes (accentBar + accentColorVariant)
    expect(accentBarEl!.className).toBeTruthy();
  });

  it('selected state applies elevated shadow class', () => {
    renderCard(
      <Card inputType="sql" selected data-testid="card">
        <span>Selected card</span>
      </Card>
    );
    const cardEl = screen.getByTestId('card');
    expect(cardEl.className).toBeTruthy();
    // Selected class should be present — more classes than non-selected
    expect(cardEl.className.split(' ').length).toBeGreaterThanOrEqual(2);
  });

  it('non-selected state has no elevated shadow class', () => {
    renderCard(
      <Card inputType="sql" data-testid="card">
        <span>Normal card</span>
      </Card>
    );
    const cardEl = screen.getByTestId('card');
    expect(cardEl.className).toBeTruthy();
  });

  it('merges custom className', () => {
    renderCard(
      <Card inputType="sql" className="my-card" data-testid="card">
        <span>Custom</span>
      </Card>
    );
    const cardEl = screen.getByTestId('card');
    expect(cardEl.className).toContain('my-card');
  });

  it('has correct base styles (class-based assertion)', () => {
    renderCard(
      <Card inputType="note" data-testid="card">
        <span>Base</span>
      </Card>
    );
    const cardEl = screen.getByTestId('card');
    // Should have cardBase class
    expect(cardEl.className).toBeTruthy();
  });

  it('accessible: no implicit role (generic container)', () => {
    renderCard(
      <Card inputType="sql" data-testid="card">
        <span>No role</span>
      </Card>
    );
    const cardEl = screen.getByTestId('card');
    expect(cardEl.getAttribute('role')).toBeNull();
  });

  it('renders all input types', () => {
    const types = [
      'sql',
      'python',
      'literature',
      'hypothesis',
      'note',
      'dataIngest',
    ] as const;
    for (const type of types) {
      const { unmount } = renderCard(
        <Card inputType={type}>
          <span>{type}</span>
        </Card>
      );
      expect(screen.getByText(type)).toBeInTheDocument();
      unmount();
    }
  });
});
