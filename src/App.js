import React from 'react';
import logo from './logo.svg';
import './App.css';
import InstallPrompt from './InstallPrompt';
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
      <InstallPrompt />
    </div>
  );
}

export default App;
