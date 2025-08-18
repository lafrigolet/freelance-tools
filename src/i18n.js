import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import yaml from 'js-yaml';


i18n
  .use(initReactI18next)
  .use(HttpBackend)
  .init({
    lng: 'en',
    debug: true,
    backend: {
      loadPath: '/locales/{{lng}}.yaml',
      parse: (data) => {
        console.log('+++++++++++++++++', data);
        return yaml.load(data);
      },
    },
  });

export default i18n;

