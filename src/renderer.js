import _ from 'lodash';

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

const renderErrors = (elements, error, prevError, i18n) => {
  const rssElement = elements.fields.rss;
  const { feedbackEl } = elements;
  if (feedbackEl.classList.contains('text-success')) {
    feedbackEl.classList.remove('text-success');
  }
  feedbackEl.classList.add('text-danger');

  const isError = (error !== null);
  const wasError = (prevError !== null);

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

const handleProcessState = (elements, value, i18n) => {
  const { feedbackEl } = elements;

  switch (value) {
    case 'sending':
      elements.submitButton.disabled = true;
      break;
    case 'error':
      elements.submitButton.disabled = false;
      break;
    case 'successfully':
      elements.submitButton.disabled = false;

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

const renderFeed = (elements, feeds, i18n) => {
  const { title, description } = _.last(feeds);
  const feedsIneer = `
    <div class="card border-0">
      <div class="card-body">
        <h1 class="card-title fs-4 fw-semibold mb-4">${i18n.t('feeds')}</h1>
        <h3 class="fw-semibold fs-6 m-0">${title}</h3>
        <p class="small text-black-50 m-0">${description}</p>
      </div>
    </div>`;

  elements.feeds.innerHTML = feedsIneer;
};

const renderPosts = (elements, posts, i18n, state) => {
  const postsInner = `
    <div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">${i18n.t('posts.title')}</h2>
      </div>
      <ul class="list-group border-0 rounded-0">
        ${posts.map(({ titlePost, linkPost, idPost }) => `
          <li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
            <a href="${linkPost}" class="${state.searсh.viewedIds.includes(idPost) ? 'link-secondary fw-normal' : 'fw-bold'}" data-id="${idPost}" target="_blank" rel="noopener noreferrer">${titlePost}</a>
            <button type="button" class="btn btn-outline-primary btn-sm" data-id="${idPost}" data-bs-toggle="modal" data-bs-target="#modal">${i18n.t('posts.btn')}</button>
          </li>`).join('')}
      </ul>  
    </div>`;

  elements.posts.innerHTML = postsInner;

  const links = elements.posts.querySelectorAll('a');
  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const { id } = event.target.dataset;
      openHolder(id, state, elements);
    });
  });

  const btnsLink = elements.posts.querySelectorAll('.btn');
  btnsLink.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const { id } = event.target.dataset;
      openHolder(id, state, elements);
    });
  });
};

export const render = (path, value, prevValue, elements, i18n, state) => {
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
      renderPosts(elements, value, i18n, state);
      break;
    default:
      break;
  }
};