import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

async function bootstrap() {
  if (import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    try {
      const { worker } = await import('./mocks/browser');
      await worker.start({ onUnhandledRequest: 'bypass' });
      console.log('[MSW] Mock Service Worker started');
    } catch (err) {
      console.warn('[MSW] Failed to start Mock Service Worker:', err);
    }
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

bootstrap();
