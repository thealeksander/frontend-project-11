import _ from 'lodash';
import * as yup from 'yup';
import i18next from 'i18next';
import resources from '../locales/index';
import onChange from 'on-change';
import { renderErrors, handleProcessState } from './render';

export default () => {
  const defaultLg = 'ru';
  const i18n = i18next.createInstance();
  i18n.init({
    lng: defaultLg,
    debug: true,
    resources,
  })
    .then(() => {
      yup.setLocale({
        string: {
          url: 'inValid',
        },
        mixed: {
          notOneOf: 'similarUrl',
        },  
      });

      const schema = (watchedLinks) => yup.string().trim().url().notOneOf(watchedLinks);

      const elements = {
        form: document.querySelector('.rss-form'),
        fields: {
          rss: document.querySelector('#url-input'),
        },
        feedbackEl: document.querySelector('.feedback'),
        submitButton: document.querySelector('#submit'),
      };
    
      const state = onChange({
        searсh: {
          mode: 'filling',
          data: {},
          watchedLinks: [],
          error: null,
        },
      }, (path, value, prevValue) => {
        console.log(path);
        switch (path) {
          case 'searсh.error':
            renderErrors(elements, value, prevValue, i18n);
            break;
          case 'searсh.mode':
            handleProcessState(elements, value, i18n);
            break;
          default:
            break;
        }
      });
    
      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();
    
        state.searсh.mode = 'sending';
        const formData = new FormData(event.target);
        const url = formData.get('url');
    
        schema(state.searсh.watchedLinks)
          .validate(url, { abortEarly: false })
          .then((urlLink) => {
            state.searсh.error = null;
            state.searсh.watchedLinks.push(urlLink);
            state.searсh.mode = 'successfully';
            return;
          })
          .catch((err) => {
            console.log(err.errors);
            state.searсh.error = err.message;
            state.searсh.mode = 'error';
            return;
          });
      });
    });
};
