import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders "The Helm" text', () => {
    render(<App />);
    expect(screen.getByText('The Helm')).toBeInTheDocument();
  });
});
