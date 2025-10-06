import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from "react-redux";
import { store, persistor } from "./store/redux";
import App from './App';
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import './App.css'
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
 <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <React.StrictMode>
        <App />
        </React.StrictMode>
      </BrowserRouter>
    </PersistGate>
  </Provider>
);