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

const updateData = (watchedState) => {
  const cb = () => {
    Promise.all(watchedState.searсh.watchedLinks.map((link) => axios.get(buildPath(link))))
      .then((responseArr) => {
        const postAll =  responseArr.reduce((acc, response) => {
          const { posts } = parser(response.data.contents);
          return [...acc, ...posts];
        }, []);
        const newPosts = _.differenceBy(postAll, Array.from(watchedState.searсh.posts), 'titlePost');
        if (newPosts.length !== 0) {
          watchedState.searсh.posts = [...newPosts, ...watchedState.searсh.posts];
        }
      })
      .catch((e) => {
        watchedState.searсh.error = 'network';
        watchedState.searсh.mode = 'error';
      })
      .finally(() => setTimeout(cb, 5000));
  };
  setTimeout(cb, 5000);
};

const openHolder = (activeId, state, elements) => {
  if (!state.searсh.viewedIds.includes(activeId)) {
    state.searсh.viewedIds.push(activeId);

    const viewedPost = document.querySelector(`a[data-id="${activeId}"]`)
    viewedPost.classList.add('link-secondary', 'fw-normal');
    viewedPost.classList.remove('fw-bolder');
  }
  const activePost = state.searсh.posts.find(({ idPost }) => idPost === activeId);
  const { titlePost, descriptionPost, linkPost } = activePost;

  const linkBtn = elements.modal.footer.querySelector('a.btn');
  elements.modal.title.textContent = titlePost;
  elements.modal.body.textContent = descriptionPost;
  linkBtn.href = linkPost;
  return;
};

export default () => {
  const defaultLg = 'ru';
  const state = {
    lng: defaultLg,
    searсh: {
      mode: 'filling',
      data: {},
      watchedLinks: [],
      feeds: {},
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

      const schema = (watchedLinks) => yup.string().trim().url().notOneOf(watchedLinks);

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
            renderPosts(elements, value, i18n);
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
        const url = formData.get('url');
    
        schema(watchedState.searсh.watchedLinks)
          .validate(url, { abortEarly: false })
          .then((urlLink) => {
            watchedState.searсh.error = null;
            watchedState.searсh.watchedLinks.push(urlLink);
            return axios.get(buildPath(urlLink));
          })
          .then((response) => {
            // console.log(response);
            const { title, description, posts }  = parser(response.data.contents);
            watchedState.searсh.feeds = { title, description };
            watchedState.searсh.posts = [ ...posts ];
            watchedState.searсh.mode = 'successfully';

            const links = elements.posts.querySelectorAll('a.card-link');
            links.forEach((link) => {
              link.addEventListener('click', (event) => {
                const linkId = event.target.dataset.id;
                watchedState.searсh.activePost = linkId;
              });
            });

            const btnsLink = elements.posts.querySelectorAll('.btn');
            btnsLink.forEach((btn) => {
              btn.addEventListener('click', (event) => {
                const id = event.target.dataset.id;
                watchedState.searсh.activePost = id;
              });
            });
          })
          .catch((err) => {
            // console.log(err.name);
            if (err.name === 'AxiosError') {
              watchedState.searсh.error = 'network';
            } else {
              // console.log(err.message);
              watchedState.searсh.error = err.message;
            }
            watchedState.searсh.mode = 'error';
          });
      });
    });
};
