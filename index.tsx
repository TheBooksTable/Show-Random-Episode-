import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/*
// SERVICE WORKER REGISTRATION DISABLED
// 
// The following code is commented out because the sandboxed environment where this application
// is executed imposes strict security restrictions that prevent service workers from registering correctly.
// This was causing repeated, unrecoverable errors on page load.
//
// By disabling this, we ensure the application remains stable and functional for all users,
// sacrificing offline PWA capabilities which are not supported by the platform.

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered successfully with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  } else {
    console.warn('Service Worker not registered: not supported or not in a secure context.');
  }
});
*/

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
