import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionHeader } from './SessionHeader';
import type { Session } from '@/generated/api/sessions.schemas';

const mockSession: Session = {
  id: 'test-session-id',
  title: 'Test Session',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
  ownerId: 'user-1',
  memberIds: ['user-1', 'user-2', 'user-3'],
  status: 'active',
};

const manyMembersSession: Session = {
  ...mockSession,
  memberIds: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
};

function renderSessionHeader(session: Session = mockSession) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter(
    [
      { path: '/session/:id', element: <SessionHeader session={session} /> },
      { path: '/', element: <div>Home Page</div> },
    ],
    { initialEntries: [`/session/${session.id}`] }
  );
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

describe('SessionHeader', () => {
  it('displays session title', () => {
    renderSessionHeader();
    expect(screen.getByTestId('session-title')).toHaveTextContent('Test Session');
  });

  it('clicking title enters edit mode', async () => {
    renderSessionHeader();
    const titleEl = screen.getByTestId('session-title');
    await userEvent.click(titleEl);
    expect(screen.getByLabelText('Edit session title')).toBeInTheDocument();
  });

  it('Escape cancels edit', async () => {
    renderSessionHeader();
    await userEvent.click(screen.getByTestId('session-title'));

    const input = screen.getByLabelText('Edit session title');
    await userEvent.clear(input);
    await userEvent.type(input, 'Changed Title');
    await userEvent.keyboard('{Escape}');

    // Should revert to original title
    expect(screen.getByTestId('session-title')).toHaveTextContent('Test Session');
  });

  it('member avatars render', () => {
    renderSessionHeader();
    expect(screen.getByTestId('member-avatars')).toBeInTheDocument();
  });

  it('overflow indicator shows for more than 5 members', () => {
    renderSessionHeader(manyMembersSession);
    expect(screen.getByTestId('member-overflow')).toBeInTheDocument();
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('delete action shows confirmation dialog', async () => {
    renderSessionHeader();
    const deleteBtn = screen.getByText('Delete');
    await userEvent.click(deleteBtn);
    expect(screen.getByText('Are you sure you want to delete this session? This action cannot be undone.')).toBeInTheDocument();
  });

  it('delete confirmation navigates to home on confirm', async () => {
    renderSessionHeader();
    await userEvent.click(screen.getByText('Delete'));

    // Click the confirm Delete button in the dialog
    const deleteButtons = screen.getAllByText('Delete');
    const confirmDeleteBtn = deleteButtons[deleteButtons.length - 1];
    await userEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });
});
