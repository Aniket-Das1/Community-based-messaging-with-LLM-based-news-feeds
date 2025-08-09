import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Main from './Main';
import reportWebVitals from './reportWebVitals';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ✅ Create a QueryClient instance
const queryClient = new QueryClient();

// ✅ Get root element and render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* ✅ Provide React Query context here */}
    <QueryClientProvider client={queryClient}>
      <Main /> {/* Or <App /> if you're using that */}
    </QueryClientProvider>
  </React.StrictMode>
);

reportWebVitals();