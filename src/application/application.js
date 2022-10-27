import _ from 'lodash';
import * as yup from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import axios from 'axios';
import resources from '../locales/index';
import buildPath from './path';
import parser from './parser';
import {
  renderErrors,
  handleProcessState,
  renderFeed,
  renderPosts,
} from './render';

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

const openHolder = (activeId, state, elements) => {
  if (!state.searсh.viewedIds.includes(activeId)) {
    state.searсh.viewedIds.push(activeId);

    const viewedPost = document.querySelector(`a[data-id="${activeId}"]`);
    viewedPost.classList.add('link-secondary', 'fw-normal');
    viewedPost.classList.remove('fw-bold');
  }
  const activePost = state.searсh.posts.find(({ idPost }) => idPost === activeId);
  const { titlePost, descriptionPost, linkPost } = activePost;

  const linkBtn = elements.modal.footer.querySelector('a.btn');
  elements.modal.title.textContent = titlePost;
  elements.modal.body.textContent = descriptionPost;
  linkBtn.href = linkPost;
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
      activePost: null,
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

      const watchedState = onChange(state, (path, value, prevValue) => {
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
            renderPosts(elements, value, i18n, state, openHolder);
            break;
          case 'searсh.activePost':
            openHolder(value, state, elements);
            break;
          default:
            break;
        }
      });

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
