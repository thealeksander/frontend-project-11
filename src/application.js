import _ from 'lodash';
import * as yup from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import axios from 'axios';
import resources from './locales/index';
import parser from './parser';
import render from './renderer';

const buildPath = (url) => {
  const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy.toString();
};

const updateData = (watchedState) => {
  const cb = () => {
    // console.log('setTimeout');
    Promise.all(watchedState.searсh.form.watchedLinks.map((link) => axios.get(buildPath(link))))
      .then((responseArr) => {
        const postAll = responseArr.reduce((acc, response) => {
          const { posts } = parser(response.data.contents);
          return [...acc, ...posts];
        }, []);
        const newPosts = _.differenceBy(postAll, Array.from(watchedState.searсh.contents.posts), 'titlePost');
        if (newPosts.length !== 0) {
          watchedState.searсh.contents.posts = [...newPosts, ...watchedState.searсh.contents.posts];
          // console.log('Update!');
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
  const state = {
    searсh: {
      form: {
        mode: 'filling',
        watchedLinks: [],
        error: null,
      },
      contents: {
        feeds: [],
        posts: [],
        viewedPosts: [],
        error: null,
      },
    },
  };

  const i18n = i18next.createInstance();
  const defaultLg = 'ru';
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

      const watchedState = onChange(state, (path, value, prevValue) => render(
        path,
        value,
        prevValue,
        elements,
        i18n,
        state,
      ));

      updateData(watchedState);

      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();

        watchedState.searсh.form.mode = 'sending';
        const formData = new FormData(event.target);
        const url = formData.get('url').trim();

        schema(watchedState.searсh.form.watchedLinks)
          .validate(url)
          .then((urlLink) => {
            watchedState.searсh.form.error = null;
            return axios.get(buildPath(urlLink));
          })
          .then((response) => {
            const { title, description, posts } = parser(response.data.contents);
            const postsWithId = posts.map((post) => ({
              idPost: _.uniqueId(),
              ...post,
            }));

            watchedState.searсh.contents.feeds = [
              ...watchedState.searсh.contents.feeds,
              { title, description },
            ];
            watchedState.searсh.contents.posts = [
              ...postsWithId,
              ...watchedState.searсh.contents.posts,
            ];
            watchedState.searсh.form.watchedLinks.push(url);
            watchedState.searсh.form.mode = 'successfully';
          })
          .catch((err) => {
            if (err.name === 'AxiosError') {
              watchedState.searсh.contents.error = 'network';
            } else {
              watchedState.searсh.form.error = err.message;
            }
            watchedState.searсh.form.mode = 'error';
          });
      });
    });
};
