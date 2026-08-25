import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const apiOrigin = window.Capacitor?.isNativePlatform?.()
  ? (process.env.REACT_APP_API_URL || 'https://clooudnova.up.railway.app')
  : '';
const nativeFetch = window.fetch.bind(window);
window.fetch = (resource, options) => {
  const requestUrl = typeof resource === 'string' ? resource : resource.url;
  if (apiOrigin && requestUrl.startsWith('/api/')) {
    return nativeFetch(`${apiOrigin}${requestUrl}`, options);
  }
  return nativeFetch(resource, options);
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
