import React from 'react';
import logo from './logo.svg';
import './App.css';
import InstallPrompt from './InstallPrompt';
import MobileCameraCapture from './MobileCameraCapture';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Mobile Camera Capture</h1>
        <MobileCameraCapture />
      </header>
      <InstallPrompt />
    </div>
  );
}

export default App;
