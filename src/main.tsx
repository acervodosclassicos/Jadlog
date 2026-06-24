import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Self-healing interceptor for client-side local database fallback (e.g., when deployed on static Vercel)
const originalFetch = window.fetch;
let useLocalDb = false;

window.fetch = async function (input, init) {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
  
  if (url.startsWith('/api')) {
    if (useLocalDb) {
      const { handleMockRequest } = await import('./lib/clientDb');
      return handleMockRequest(url, init);
    }

    try {
      const response = await originalFetch(input, init);
      const contentType = response.headers.get('content-type');
      
      // Vercel/Static hosting error pages are HTML, not JSON
      if (!response.ok && (response.status === 404 || (contentType && contentType.includes('text/html')))) {
        console.warn('Backend returned HTML instead of API. Switching to client-side fallback database.');
        useLocalDb = true;
        const { handleMockRequest } = await import('./lib/clientDb');
        return handleMockRequest(url, init);
      }
      return response;
    } catch (error) {
      console.warn('Network error reaching backend. Switching to client-side fallback database.', error);
      useLocalDb = true;
      const { handleMockRequest } = await import('./lib/clientDb');
      return handleMockRequest(url, init);
    }
  }

  return originalFetch(input, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

