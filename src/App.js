import React from 'react';
import logo from './logo.svg';
import './App.css';
import InstallPrompt from './InstallPrompt';
import { MobileCameraCaptureWithOverlay } from './MobileCameraCapture';
import InvoiceForm from './InvoiceForm';
import PackageSubscriptionForm from './PackageSubscriptionForm';
import CheckoutButton from './CheckoutButton';
import LoginDialog from './LoginDialog';
import SignUpDialog from './SignUpDialog';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Login Form</h1>
        {/*<CheckoutButton totalAmount="100" availableMethods="['tarjeta', 'google-pay', 'bizum', 'amazon-pay', 'apple-pay']"/>--*/}
        <LoginDialog />
        <SignUpDialog />
      </header>
      <InstallPrompt />
    </div>
  );
}

export default App;
