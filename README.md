# i18n Internationalization

This branch is the setup for base for internationalization.
This document explains the purpose of the i18n-related files in the project.
For installing run **npm install**

src/
 ├─ i18n.js
 ├─ components/
 │   └─ LanguageSelector.js
 └─ App.jsx
public/
 └─ locales/
     ├─ en.yaml
     └─ fr.yaml


---

## `src/i18n.js`
- Initializes i18next for the app.
- Loads translation resources (from `src/locales/`).
- Sets default language and fallback language.
- Exports the i18n instance so React components can use it.

---

## `src/components/LanguageSelector.js`
- React component to choose a language (e.g. `en` or `fr`).
- Uses `i18n.changeLanguage(lang)` from `react-i18next`.
- Updates the active language instantly when the user selects one.

---

## `src/App.js`
- The main application component.
- Uses the `useTranslation` hook (`const { t } = useTranslation()`).
- Calls `t("key")` to display the correct translation.
- Likely includes `<LanguageSelector />` to let users switch languages.

---

## Translation Files 
- `src/locales/en.yaml` English translations in YAML format.
- `src/locales/fr.yaml` French translations in YAML format.



