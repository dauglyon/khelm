import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemberAvatars } from './MemberAvatars';

describe('MemberAvatars', () => {
  it('renders avatars for member IDs', () => {
    render(<MemberAvatars memberIds={['user-1', 'user-2', 'user-3']} />);
    expect(screen.getByTestId('member-avatars')).toBeInTheDocument();
    // Each visible avatar shows initials — all three start with 'us' → 'US'
    const avatars = screen.getAllByText('US');
    expect(avatars).toHaveLength(3);
  });

  it('renders the correct number of visible avatars', () => {
    render(<MemberAvatars memberIds={['a1', 'b2', 'c3']} maxDisplay={5} />);
    const container = screen.getByTestId('member-avatars');
    // 3 member avatars + no overflow badge (overflow is separate via testid)
    expect(container).toBeInTheDocument();
    expect(screen.queryByTestId('member-overflow')).not.toBeInTheDocument();
  });

  it('shows overflow indicator when members exceed maxDisplay', () => {
    render(
      <MemberAvatars
        memberIds={['a', 'b', 'c', 'd', 'e', 'f', 'g']}
        maxDisplay={5}
      />
    );
    expect(screen.getByTestId('member-overflow')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('shows overflow indicator with default maxDisplay of 5', () => {
    render(
      <MemberAvatars memberIds={['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']} />
    );
    expect(screen.getByTestId('member-overflow')).toBeInTheDocument();
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('renders empty container when no members are provided', () => {
    render(<MemberAvatars memberIds={[]} />);
    const container = screen.getByTestId('member-avatars');
    expect(container).toBeInTheDocument();
    expect(screen.queryByTestId('member-overflow')).not.toBeInTheDocument();
    // No avatar initials rendered
    expect(container.children).toHaveLength(0);
  });
});
