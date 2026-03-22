import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { NewSessionDialog } from './NewSessionDialog';

function renderDialog() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter(
    [
      { path: '/session/new', element: <NewSessionDialog /> },
      { path: '/session/:id', element: <div>Workspace</div> },
    ],
    { initialEntries: ['/session/new'] }
  );
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

describe('NewSessionDialog', () => {
  it('renders title input and create button', () => {
    renderDialog();
    expect(screen.getByLabelText('Session title')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('create button is disabled when title is empty', () => {
    renderDialog();
    const createBtn = screen.getByText('Create');
    expect(createBtn).toBeDisabled();
  });

  it('create button is enabled when title is entered', async () => {
    renderDialog();
    const input = screen.getByLabelText('Session title');
    await userEvent.type(input, 'My New Session');
    const createBtn = screen.getByText('Create');
    expect(createBtn).not.toBeDisabled();
  });

  it('shows an error alert when session creation fails', async () => {
    server.use(
      http.post('*/sessions', () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    renderDialog();
    const input = screen.getByLabelText('Session title');
    await userEvent.type(input, 'My Session');

    const createBtn = screen.getByText('Create');
    await userEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Failed to create session. Please try again.'
    );
  });

  it('submitting creates a session and navigates', async () => {
    renderDialog();
    const input = screen.getByLabelText('Session title');
    await userEvent.type(input, 'Test Session');

    const createBtn = screen.getByText('Create');
    await userEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByText('Workspace')).toBeInTheDocument();
    });
  });
});
