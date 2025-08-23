import React from 'react';
import './App.css';
import { LoginDialog, LoginButton } from './features/auth/LoginDialog';
import SignUpDialog from './features/auth/SignUpDialog';
import { AuthProvider } from "./features/auth/AuthContext";
import InvoiceForm from "./features/invoices/invoice.form";
import QRCode from "./features/invoices/qrcode";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <header className="App-header">
          <h1>Login Form</h1>
          <LoginButton />
          <SignUpDialog />
          <InvoiceForm />
          <QRCode
            nif="89890001K"
            numserie="12345678-G33"
            fecha="01-09-2024"
            importe={241.40}
            verificable={true}     // Cambia a false para "no verificable"
          produccion={false}     // Cambia a true para entorno real AEAT
          />
        </header>
      </div>
    </AuthProvider>
  );
}

export default App;

// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
