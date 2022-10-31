import _ from 'lodash';
import * as yup from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import axios from 'axios';
import resources from './locales/index';
import parser from './parser';
import { render } from './renderer';

const buildPath  = (url) => {
  const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy.toString();
};

const updateData = (watchedState) => {
  const cb = () => {
    console.log('setTimeout');
    Promise.all(watchedState.searсh.watchedLinks.map((link) => axios.get(buildPath(link))))
      .then((responseArr) => {
        const postAll = responseArr.reduce((acc, response) => {
          const { posts } = parser(response.data.contents);
          return [...acc, ...posts];
        }, []);
        const newPosts = _.differenceBy(postAll, Array.from(watchedState.searсh.posts), 'titlePost');
        if (newPosts.length !== 0) {
          watchedState.searсh.posts = [...newPosts, ...watchedState.searсh.posts];
          console.log('Update!');
        }
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => setTimeout(cb, 5000));
  };
  setTimeout(cb, 5000);
};

export default () => {
  const defaultLg = 'ru';
  const state = {
    lng: defaultLg,
    searсh: {
      mode: 'filling',
      data: {},
      watchedLinks: [],
      feeds: [],
      posts: [],
      viewedIds: [],
      error: null,
    },
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: state.lng,
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

      const schema = (watchedLinks) => yup.string().url().required().notOneOf(watchedLinks);

      const elements = {
        modal: {
          title: document.querySelector('.modal-title'),
          body: document.querySelector('.modal-body'),
          footer: document.querySelector('.modal-footer'),
        },
        form: document.querySelector('.rss-form'),
        fields: {
          rss: document.querySelector('#url-input'),
        },
        feedbackEl: document.querySelector('.feedback'),
        submitButton: document.querySelector('#submit'),
        feeds: document.querySelector('.feeds'),
        posts: document.querySelector('.posts'),
      };

      const watchedState = onChange(state, (path, value, prevValue) => render(path, value, prevValue, elements, i18n, state));

      updateData(watchedState);

      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();

        watchedState.searсh.mode = 'sending';
        const formData = new FormData(event.target);
        const url = formData.get('url').trim();

        schema(watchedState.searсh.watchedLinks)
          .validate(url)
          .then((urlLink) => {
            watchedState.searсh.error = null;
            return axios.get(buildPath(urlLink));
          })
          .then((response) => {
            console.log(watchedState.searсh.watchedLinks);
            const { title, description, posts } = parser(response.data.contents);
            console.log([...watchedState.searсh.feeds, { title, description }]);
            watchedState.searсh.feeds = [...watchedState.searсh.feeds, { title, description }];
            watchedState.searсh.posts = [...posts, ...watchedState.searсh.posts];
            watchedState.searсh.watchedLinks.push(url);
            watchedState.searсh.mode = 'successfully';
          })
          .catch((err) => {
            if (err.name === 'AxiosError') {
              watchedState.searсh.error = 'network';
            } else {
              watchedState.searсh.error = err.message;
            }
            watchedState.searсh.mode = 'error';
          });
      });
    });
};
