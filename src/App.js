import React from 'react';
import logo from './logo.svg';
import './App.css';
import InstallPrompt from './InstallPrompt';
import { MobileCameraCaptureWithOverlay } from './MobileCameraCapture';
import InvoiceForm from './InvoiceForm';
import PackageSubscriptionForm from './PackageSubscriptionForm';
import CheckoutButton from './CheckoutButton';
import { LoginDialog, LoginButton } from './LoginDialog';
import SignUpDialog from './SignUpDialog';
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <header className="App-header">
          <h1>Login Form</h1>
          {/*<CheckoutButton totalAmount="100" availableMethods="['tarjeta', 'google-pay', 'bizum', 'amazon-pay', 'apple-pay']"/>*/}
          <LoginButton />
          <SignUpDialog />
        </header>
        <InstallPrompt />
      </div>
    </AuthProvider>
  );
}

export default App;
