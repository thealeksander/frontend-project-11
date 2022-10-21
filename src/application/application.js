import _ from 'lodash';
import * as yup from 'yup';
import i18next from 'i18next';
import resources from '../locales/index';
import onChange from 'on-change';
import { renderErrors, handleProcessState } from './render';

yup.setLocale({
  mixed: {
    default: 'valid',
  },  
  // notOneOf: i18next.t('errorsMessage.similarUrl'),
});

const schema = (watchedLinks) => yup.string().trim().url().notOneOf(watchedLinks, 'RSS уже существует!');

export default () => {
  const defaultLg = 'ru';
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLg,
    debug: true,
    resources,
  })
    .then(() => {
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
          state: 'filling',
          data: {},
          watchedLinks: [],
          error: null,
        },
      }, (path, value, prevValue) => {
        // console.log(path);
        switch (path) {
          case 'searсh.error':
            renderErrors(elements, value, prevValue);
            break;
          case 'search.state':
            handleProcessState(elements, value);
            break;
          default:
            break;
        }
      });
    
      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();
    
        state.searсh.state = 'sending';
        const formData = new FormData(event.target);
        const url = formData.get('url');
    
        schema(state.searсh.watchedLinks)
          .validate(url, { abortEarly: false })
          .then((urlLink) => {
            state.searсh.error = null;
            state.searсh.watchedLinks.push(urlLink);
            return;
          })
          .catch((err) => {
            console.log(err.errors);
            state.searсh.error = err.message;
            return;
          });
      });
    });
};
