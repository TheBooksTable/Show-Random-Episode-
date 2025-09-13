import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Register the service worker for PWA functionality
if ('serviceWorker' in navigator) {
  // It's best practice to wait for the page to be fully loaded before registering.
  // This avoids contention for network resources during the initial page load.
  window.addEventListener('load', () => {
    // Use a small timeout to push the registration to the end of the event queue.
    // This can help resolve "invalid state" errors in some environments by ensuring
    // the document is fully stable before registration is attempted.
    setTimeout(() => {
      // Construct an absolute URL to prevent cross-origin errors in sandboxed environments.
      const swUrl = `${location.origin}/service-worker.js`;
      navigator.serviceWorker.register(swUrl)
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }, 100); // 100ms delay to ensure document is stable
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);