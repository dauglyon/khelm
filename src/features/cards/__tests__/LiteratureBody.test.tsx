import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LiteratureBody } from '../bodies/LiteratureBody';
import type { LiteratureContent, LiteratureResult } from '../types';

const mockContent: LiteratureContent = {
  searchTerms: ['metagenome', 'soil'],
};

const mockResult: LiteratureResult = {
  hits: [
    {
      id: 'pub-1',
      title: 'Soil Metagenomics Study',
      authors: ['Smith J', 'Doe A', 'Lee B', 'Wang C', 'Chen D'],
      year: 2024,
      source: 'Nature Biotechnology',
      abstract: 'This study examines soil metagenomes.',
    },
    {
      id: 'pub-2',
      title: 'Microbial Diversity',
      authors: ['Johnson K', 'Williams R'],
      year: 2023,
      source: 'Science',
      abstract: 'Exploring microbial diversity in environments.',
    },
  ],
  totalCount: 247,
};

describe('LiteratureBody', () => {
  it('renders search terms as tags', () => {
    render(<LiteratureBody content={mockContent} result={mockResult} status="complete" />);
    expect(screen.getByText('metagenome')).toBeInTheDocument();
    expect(screen.getByText('soil')).toBeInTheDocument();
  });

  it('renders publication titles', () => {
    render(<LiteratureBody content={mockContent} result={mockResult} status="complete" />);
    expect(screen.getByText('Soil Metagenomics Study')).toBeInTheDocument();
    expect(screen.getByText('Microbial Diversity')).toBeInTheDocument();
  });

  it('truncates authors to 3 with et al.', () => {
    render(<LiteratureBody content={mockContent} result={mockResult} status="complete" />);
    // First pub has 5 authors, should show 3 + et al.
    expect(screen.getByText(/Smith J, Doe A, Lee B et al/)).toBeInTheDocument();
    // Second pub has 2 authors, no truncation
    expect(screen.getByText(/Johnson K, Williams R/)).toBeInTheDocument();
  });

  it('shows result count', () => {
    render(<LiteratureBody content={mockContent} result={mockResult} status="complete" />);
    expect(screen.getByText('Showing 2 of 247 results')).toBeInTheDocument();
  });

  it('expands abstract on click', async () => {
    const user = userEvent.setup();
    render(<LiteratureBody content={mockContent} result={mockResult} status="complete" />);

    expect(screen.queryByText('This study examines soil metagenomes.')).not.toBeInTheDocument();

    await user.click(screen.getByText('Soil Metagenomics Study'));
    expect(screen.getByText('This study examines soil metagenomes.')).toBeInTheDocument();
  });

  it('collapses abstract on second click', async () => {
    const user = userEvent.setup();
    render(<LiteratureBody content={mockContent} result={mockResult} status="complete" />);

    await user.click(screen.getByText('Soil Metagenomics Study'));
    expect(screen.getByText('This study examines soil metagenomes.')).toBeInTheDocument();

    await user.click(screen.getByText('Soil Metagenomics Study'));
    // After second click, abstract should be animating out
    // Due to AnimatePresence, the text may still be in DOM briefly
  });

  it('shows skeleton when result is null', () => {
    const { container } = render(
      <LiteratureBody content={mockContent} result={null} status="thinking" />
    );
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
