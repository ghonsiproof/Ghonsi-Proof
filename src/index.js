/* eslint-disable import/first */
import { Buffer } from 'buffer';
window.Buffer = Buffer;

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

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

// Suppress benign ResizeObserver warning in dev
const resizeObserverErr = window.onerror;
window.onerror = (msg, ...args) => {
  if (msg.includes('ResizeObserver')) return true;
  return resizeObserverErr?.(...args);
};