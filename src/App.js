import React from 'react';
import logo from './logo.svg';
import './App.css';
import InstallPrompt from './InstallPrompt';
import { MobileCameraCaptureWithOverlay } from './MobileCameraCapture';
import InvoiceForm from './InvoiceForm';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Invoice Capture</h1>
        <InvoiceForm />
      </header>
      <InstallPrompt />
    </div>
  );
}

export default App;
