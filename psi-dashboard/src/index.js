import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import PostStatusIndicatorContextProvider from './contexts/PostStatusIndicatorContext';

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(
    <PostStatusIndicatorContextProvider>
      <BrowserRouter>
        <App/>
      </BrowserRouter>
    </PostStatusIndicatorContextProvider>,
    document.getElementById('psi-dashboard')
  );
});
