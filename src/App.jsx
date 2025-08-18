import React from 'react';
import './App.css';
import LanguageSelector from "./LanguageSelector";
import "./i18n"; // import i18n setup
import { useTranslation } from "react-i18next";
import { Container, Typography } from "@mui/material";

function App() {
  const { t } = useTranslation();

  return (
    <div className="App">
      <header className="App-header">
        <h1>i18n Internationalization</h1>
        <LanguageSelector />
        <Typography variant="h4" sx={{ mt: 3 }}>
          {t("greeting")}
        </Typography>
      </header>
    </div>
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
