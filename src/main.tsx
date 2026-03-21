import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@/app/App';
import { isMocksEnabled } from '@/common/utils/env';

async function bootstrap() {
  if (isMocksEnabled()) {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
