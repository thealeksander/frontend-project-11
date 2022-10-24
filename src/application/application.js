import _ from 'lodash';
import * as yup from 'yup';
import i18next from 'i18next';
import resources from '../locales/index';
import onChange from 'on-change';
import axios from 'axios';
import buildPath from './path';
import parser from './parser';
import { 
  renderErrors, 
  handleProcessState,
  renderFeed,
  renderPosts,
} from './render';

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
        feeds: document.querySelector('.feeds'),
        posts: document.querySelector('.posts'),
      };
    
      const state = onChange({
        searсh: {
          mode: 'filling',
          data: {},
          watchedLinks: [],
          feeds: {},
          posts: [], 
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
          case 'searсh.feeds':
            renderFeed(elements, value, i18n);
            break;
          case 'searсh.posts':
            renderPosts(elements, value, i18n);
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
            axios.get(buildPath(urlLink))
          })
          .then((response) => {
            const { title, description, posts }  = parser(response.data.contents);
            state.searсh.feeds = { title, description };
            state.searсh.posts = [ ...posts ];
            console.log(state.searсh.feeds);
            console.log(state.searсh.posts);
            state.searсh.mode = 'successfully';
          })
          .catch((err) => {
            console.log(err.name);
            if (err.name === 'AxiosError') {
              state.searсh.error = 'network';
            } else if (err.name === 'ValidationError') {
              console.log(err.message);
              state.searсh.error = err.message;
            }
            state.searсh.mode = 'error';
          });
      });
    });
};
