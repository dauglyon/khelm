import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HypothesisBody } from '../bodies/HypothesisBody';
import type { HypothesisContent, HypothesisResult } from '../types';

const mockContent: HypothesisContent = {
  claim: 'Soil depth correlates with microbial diversity',
  evidence: 'Based on 2023 study',
  domain: 'metagenomics',
};

const mockResult: HypothesisResult = {
  analysis: 'The hypothesis is supported by multiple datasets.',
  suggestedQueries: [
    { type: 'sql', label: 'Query depth vs diversity', content: 'SELECT ...' },
    { type: 'python', label: 'Plot correlation', content: 'import matplotlib...' },
  ],
  confidence: 0.85,
};

describe('HypothesisBody', () => {
  it('renders claim in callout', () => {
    render(<HypothesisBody content={mockContent} result={mockResult} status="complete" />);
    expect(screen.getByText('Soil depth correlates with microbial diversity')).toBeInTheDocument();
  });

  it('renders evidence when present', () => {
    render(<HypothesisBody content={mockContent} result={mockResult} status="complete" />);
    expect(screen.getByText('Based on 2023 study')).toBeInTheDocument();
  });

  it('renders domain tag when present', () => {
    render(<HypothesisBody content={mockContent} result={mockResult} status="complete" />);
    expect(screen.getByText('metagenomics')).toBeInTheDocument();
  });

  it('renders analysis text', () => {
    render(<HypothesisBody content={mockContent} result={mockResult} status="complete" />);
    expect(screen.getByText('The hypothesis is supported by multiple datasets.')).toBeInTheDocument();
  });

  it('renders confidence indicator', () => {
    render(<HypothesisBody content={mockContent} result={mockResult} status="complete" />);
    expect(screen.getByText('Confidence: 85%')).toBeInTheDocument();
  });

  it('renders suggested query chips', () => {
    render(<HypothesisBody content={mockContent} result={mockResult} status="complete" />);
    expect(screen.getByText('Query depth vs diversity')).toBeInTheDocument();
    expect(screen.getByText('Plot correlation')).toBeInTheDocument();
  });

  it('fires onSuggestedQueryClick when chip is clicked', async () => {
    const user = userEvent.setup();
    const onSuggestedQueryClick = vi.fn();
    render(
      <HypothesisBody
        content={mockContent}
        result={mockResult}
        status="complete"
        onSuggestedQueryClick={onSuggestedQueryClick}
      />
    );

    await user.click(screen.getByText('Query depth vs diversity'));
    expect(onSuggestedQueryClick).toHaveBeenCalledWith(mockResult.suggestedQueries[0]);
  });

  it('shows streaming content during running status', () => {
    render(
      <HypothesisBody
        content={mockContent}
        result={null}
        status="running"
        streamingContent="partial analysis..."
      />
    );
    expect(screen.getByText('partial analysis...')).toBeInTheDocument();
  });

  it('shows skeleton when no result and thinking', () => {
    const { container } = render(
      <HypothesisBody content={mockContent} result={null} status="thinking" />
    );
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('does not show chips during thinking/running', () => {
    render(
      <HypothesisBody
        content={mockContent}
        result={null}
        status="running"
      />
    );
    expect(screen.queryByText('Query depth vs diversity')).not.toBeInTheDocument();
  });
});
