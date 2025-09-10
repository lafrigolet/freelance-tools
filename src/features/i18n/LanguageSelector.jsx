// LanguageSelector.jsx
import React from "react";
import { IconButton, Avatar } from "@mui/material";
import { useTranslation } from "react-i18next";
import Flag from "react-world-flags";

const languages = [
  { code: "en", country: "us" },
  { code: "es", country: "es" },
  { code: "fr", country: "fr" },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const currentIndex = languages.findIndex((l) => l.code === i18n.language);

  const handleChange = () => {
    const nextIndex = (currentIndex + 1) % languages.length;
    i18n.changeLanguage(languages[nextIndex].code);
  };

  const currentLang = languages[currentIndex] || languages[0];

  return (
    <IconButton onClick={handleChange} size="large">
      <Avatar sx={{ width: 24, height: 24, p: 0 }}>
        <Flag
          code={currentLang.country}
          alt={currentLang.code}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      </Avatar>
    </IconButton>
  );
}
