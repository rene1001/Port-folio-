// Ensure window.fetch has both getter and setter for browser extensions and test executors
try {
  let _fetch = window.fetch;
  Object.defineProperty(window, 'fetch', {
    configurable: true,
    enumerable: true,
    get() {
      return _fetch;
    },
    set(newFetch) {
      _fetch = newFetch;
    },
  });
} catch (_) {}

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
