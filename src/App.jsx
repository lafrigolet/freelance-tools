// App.jsx
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./features/navbar/Navbar";

const theme = createTheme();

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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <main style={{ marginTop: 80, padding: 20 }}>
          <Routes>
            <Route path="/" element={<Home /> } />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </Router>
    </ThemeProvider>
  );
}

export default App;
