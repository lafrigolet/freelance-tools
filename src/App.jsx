import React from 'react';
import './App.css';
import LanguageSelector from "./features/i18n/LanguageSelector";
import "./i18n"; // import i18n setup
import { useTranslation } from "react-i18next";
import { Container, Typography } from "@mui/material";



// App.jsx
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./features/navbar/Navbar";

const theme = createTheme({
  palette: {
    mode: "light", // or "dark"
    primary: {
      main: "#1976d2", // blue
    },
    secondary: {
      main: "#dc004e", // pink/red
    },
    background: {
      default: "#f5f5f5", // page background
      paper: "#ffffff",   // cards, sheets
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 500,
    },
    body1: {
      fontSize: "1rem",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12, // rounded buttons
          textTransform: "none", // keep text case as written
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none", // remove shadow
          borderBottom: "1px solid #e0e0e0",
        },
      },
    },
  },
});

function Home() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

function About() {
  return (
    <div>
      <h1>About Page</h1>
      <p>This is a simple app built with Vite + React + MUI.</p>
    </div>
  );
}

function App() {
  const { t } = useTranslation();
  const menu = [
    ["Home", "/"],
    ["Language", "/languageselector"],
    ["About", "/about"],
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar searchbar={true} menu={menu} />
        <main style={{ marginTop: 80, padding: 20 }}>
          <Routes>
            <Route path="/" element={<Home /> } />
            <Route path="/languageselector" element=
                   {
                     <>
                       <header className="App-header">
                         <h1>i18n Internationalization</h1>
                         <LanguageSelector />
                         <Typography variant="h4" sx={{ mt: 3 }}>
                           {t("greeting")}
                         </Typography>
                       </header>
                     </>
                   }
            />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </Router>
    </ThemeProvider>
  );
}

export default App;
