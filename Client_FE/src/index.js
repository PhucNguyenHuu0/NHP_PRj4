import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import App from './App';
import './index.css';

// Cấu hình retry cho axios
axiosRetry(axios, {
  retries: 3, // Số lần thử lại
  retryDelay: (retryCount) => {
    return retryCount * 2000; // Delay tăng dần: 2s, 4s, 6s
  },
  retryCondition: (error) => {
    return error.response?.status === 429; // Chỉ retry khi gặp lỗi 429
  },
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);