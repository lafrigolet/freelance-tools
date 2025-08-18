import React from "react";
import { useTranslation } from "react-i18next";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

export default function LanguageSelector() {
  const { i18n, t } = useTranslation();

  const handleChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <FormControl variant="outlined" sx={{ minWidth: 120 }}>
      <Select
        labelId="language-select-label"
        value={i18n.language}
        onChange={handleChange}
      >
        <MenuItem value="en">Ingles</MenuItem>
        <MenuItem value="fr">Frances</MenuItem>
      </Select>
    </FormControl>
  );
}
