import React from 'react';
import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { Http } from '@capacitor-community/http';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const apiBaseUrl = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
const nativeFetch = window.fetch.bind(window);
window.fetch = (input, init) => {
  if (typeof input === 'string' && input.startsWith('/api/')) {
    if (Capacitor.isNativePlatform()) {
      const headers = { ...(init?.headers || {}) };
      let body;
      try {
        body = init?.body ? JSON.parse(init.body) : undefined;
      } catch {
        body = init?.body;
      }
      return Http.request({
        url: `${apiBaseUrl}${input}`,
        method: init?.method || 'GET',
        headers,
        data: body,
        responseType: 'json',
        connectTimeout: 15000,
        readTimeout: 15000,
      }).then(response => new Response(
        typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
        { status: response.status, headers: response.headers }
      )).catch(() => nativeFetch(`${apiBaseUrl}${input}`, init));
    }
    return nativeFetch(`${apiBaseUrl}${input}`, init);
  }
  return nativeFetch(input, init);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
