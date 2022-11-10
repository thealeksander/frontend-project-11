import 'bootstrap';
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
    const savedUrls = watchedState.contents.feeds.map((el) => el.url);
    const promises = savedUrls.map((link) => axios.get(buildPath(link))
      .then((response) => parser(response.data.contents))
      .catch((e) => console.log(e)));
    Promise.all(promises)
      .then((responseArr) => {
        const postAll = responseArr.reduce((acc, { posts }) => {
          const postsWithId = posts.map((post) => ({
            id: _.uniqueId(),
            ...post,
          }));
          return [...acc, ...postsWithId];
        }, []);
        const newPosts = _.differenceBy(postAll, Array.from(watchedState.contents.posts), 'titlePost');
        if (newPosts.length !== 0) {
          watchedState.contents.posts = [...newPosts, ...watchedState.contents.posts];
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
  const state = {
    form: {
      mode: 'filling',
      error: null,
    },
    contents: {
      feeds: [],
      posts: [],
      activePost: null,
      viewedPosts: [],
      error: null,
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

      const watchedState = onChange(state, (path, value, prevValue) => {
        render(path, value, prevValue, elements, i18n, state);
      });

      updateData(watchedState);

      elements.posts.addEventListener('click', (event) => {
        const { id } = event.target.dataset;
        if (!watchedState.contents.viewedPosts.includes(id)) {
          watchedState.contents.viewedPosts = [...watchedState.contents.viewedPosts, id];
          watchedState.contents.posts = [...watchedState.contents.posts];
        }

        watchedState.contents.activePost = id;
      });

      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();

        watchedState.form.mode = 'sending';
        const formData = new FormData(event.target);
        const url = formData.get('url').trim();
        const savedUrls = watchedState.contents.feeds.map((el) => el.url);

        schema(savedUrls)
          .validate(url)
          .then((urlLink) => {
            watchedState.form.error = null;
            return axios.get(buildPath(urlLink));
          })
          .then((response) => {
            const { title, description, posts } = parser(response.data.contents);
            const postsWithId = posts.map((post) => ({
              id: _.uniqueId(),
              ...post,
            }));

            watchedState.contents.feeds = [
              ...watchedState.contents.feeds,
              { title, description, url },
            ];
            watchedState.contents.posts = [
              ...postsWithId,
              ...watchedState.contents.posts,
            ];
            watchedState.form.mode = 'successfully';
          })
          .catch((err) => {
            if (err.name === 'AxiosError') {
              watchedState.contents.error = 'network';
            } else {
              watchedState.form.error = err.message;
            }
            watchedState.form.mode = 'error';
          });
      });
    });
};
