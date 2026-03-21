import { createBrowserRouter } from 'react-router';
import { HomePage } from '@/features/sessions/pages/HomePage';
import { NewSessionPage } from '@/features/sessions/pages/NewSessionPage';
import { WorkspacePage } from '@/features/sessions/pages/WorkspacePage';
import { JoinSessionPage } from '@/features/sessions/pages/JoinSessionPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { AuthCallbackPage } from '@/features/auth/pages/AuthCallbackPage';
import { NotFoundPage } from './NotFoundPage';
import { RequireAuth } from './guards/RequireAuth';
import { RequireSession } from './guards/RequireSession';

/**
 * Application route table.
 * React Router v7 library mode (not framework/file-based routing).
 */
export const routeConfig = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/session/new',
        element: <NewSessionPage />,
      },
      {
        element: <RequireSession />,
        children: [
          {
            path: '/session/:id',
            element: <WorkspacePage />,
          },
        ],
      },
    ],
  },
  {
    path: '/session/:id/join',
    element: <JoinSessionPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/callback',
    element: <AuthCallbackPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export const router = createBrowserRouter(routeConfig);
