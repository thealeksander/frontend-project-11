import _ from 'lodash';

export const renderErrors = (elements, error, prevError, i18n) => {
  const rssElement = elements.fields.rss;
  const feedbackEl = elements.feedbackEl;
  if (feedbackEl.classList.contains('text-success')) {
    feedbackEl.classList.remove('text-success');
  }
  feedbackEl.classList.add('text-danger');

  const isError = (error !== null) ? true : false;
  const wasError = (prevError !== null) ? true : false;

  if (!wasError && !isError) {
    return;
  }
  if (wasError && !isError) {
    rssElement.classList.remove('is-invalid');
    feedbackEl.textContent = '';
    return;
  }
  if (wasError && isError) {
    feedbackEl.textContent = i18n.t(`feedbackText.${error}`);
    return;
  }

  rssElement.classList.add('is-invalid');
  feedbackEl.textContent = i18n.t(`feedbackText.${error}`);
};

export const handleProcessState = (elements, value, i18n) => {
  switch (value) {
    case 'sending':
      elements.submitButton.disabled = true;
      break;
    case 'error':
      elements.submitButton.disabled = false;
      break;
    case 'successfully':
      elements.submitButton.disabled = false;

      const feedbackEl = elements.feedbackEl;
      if (feedbackEl.classList.contains('text-danger')) {
        feedbackEl.classList.remove('text-danger');
      }
      feedbackEl.classList.add('text-success');
      feedbackEl.textContent = i18n.t(`feedbackText.${value}`);
      elements.fields.rss.value = '';
      elements.fields.rss.focus();
      break;
    default:
      break;
  }
};

export const renderFeed = (elements, feeds, i18n) => {
  const { title, description } = _.last(feeds);
  const feedsIneer =
    `<div class="card border-0">
      <div class="card-body">
        <h1 class="card-title fs-4 fw-semibold mb-4">${i18n.t('feeds')}</h1>
        <h3 class="fw-semibold fs-6 m-0">${title}</h3>
        <p class="small text-black-50 m-0">${description}</p>
      </div>
    </div>`;

  elements.feeds.innerHTML = feedsIneer;
};

export const renderPosts = (elements, posts, i18n, state, openHolder) => {
  const postsInner =
    `<div class="card border-0">
      <div class="card-body fs-4 fw-semibold border-0">
        ${i18n.t('posts.title')}
      </div>
      <ul class="list-group list-group-flush">
        ${posts.map(({ titlePost, linkPost, idPost }) => {
          return `<li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
            <a href="${linkPost}" class="card-link ${state.searсh.viewedIds.includes(idPost) ? 'link-secondary fw-normal' : 'fw-bold'}" data-id="${idPost}" target="_blank" rel="noopener noreferrer">${titlePost}</a>
            <button type="button" class="btn btn-outline-primary btn-sm" data-id="${idPost}" data-bs-toggle="modal" data-bs-target="#modal">${i18n.t('posts.btn')}</button>
          </li>`
        }).join('')}
      </ul>  
    </div>`;

  elements.posts.innerHTML = postsInner;

  const links = elements.posts.querySelectorAll('a.card-link');
  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = event.target.dataset.id;
      openHolder(id, state, elements);
    });
  });

  const btnsLink = elements.posts.querySelectorAll('.btn');
  btnsLink.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const id = event.target.dataset.id;
      openHolder(id, state, elements);
    });
  });
};