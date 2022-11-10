import _ from 'lodash';

const openHolder = (activeId, state, elements) => {
  if (!state.contents.viewedPosts.includes(activeId)) {
    const viewedPost = document.querySelector(`a[data-id="${activeId}"]`);
    viewedPost.classList.add('link-secondary', 'fw-normal');
    viewedPost.classList.remove('fw-bold');
  }
  const activePost = state.contents.posts.find(({ id }) => id === activeId);
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
      <div class="card-body"></div>
    </div>`;

  elements.feeds.innerHTML = feedsIneer;
  const cardBody = elements.feeds.querySelector('.card-body');

  const titleFeeds = document.createElement('h1');
  titleFeeds.classList.add('card-title', 'fs-4', 'fw-semibold', 'mb-4');
  titleFeeds.textContent = i18n.t('feeds');
  const titleFeed = document.createElement('h3');
  titleFeed.classList.add('fw-semibold', 'fs-6', 'm-0');
  titleFeed.textContent = title;
  const descriptionFeed = document.createElement('p');
  descriptionFeed.classList.add('small', 'text-black-50', 'm-0');
  descriptionFeed.textContent = description;

  cardBody.append(titleFeeds, titleFeed, descriptionFeed);
};

const renderPosts = (elements, posts, i18n, state) => {
  const postsInner = `
    <div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">${i18n.t('posts.title')}</h2>
      </div>
      <ul class="list-group border-0 rounded-0"></ul>  
    </div>`;

  elements.posts.innerHTML = postsInner;
  const listPosts = elements.posts.querySelector('.list-group');

  posts.forEach(({ titlePost, linkPost, id }) => {
    const tagLi = document.createElement('li');
    const tagA = document.createElement('a');
    const button = document.createElement('button');

    tagLi.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    // const classForTagA = (state.contents.viewedPosts.includes(id)) ? 'link-secondary fw-normal' : 'fw-bold';
    // tagA.classList.add(classForTagA);
    if (state.contents.viewedPosts.includes(id)) {
      tagA.classList.add('link-secondary', 'fw-normal');
    } else {
      tagA.classList.add('fw-bold');
    }
    tagA.setAttribute('href', linkPost);
    tagA.setAttribute('data-id', id);
    tagA.setAttribute('target', '_blank');
    tagA.setAttribute('rel', 'noopener noreferrer');
    tagA.textContent = titlePost;

    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18n.t('posts.btn');

    tagLi.append(tagA, button);
    listPosts.append(tagLi);
  });
};

export default (path, value, prevValue, elements, i18n, state) => {
  switch (path) {
    case 'form.error':
      renderErrors(elements, value, prevValue, i18n);
      break;
    case 'contents.error':
      renderErrors(elements, value, prevValue, i18n);
      break;
    case 'form.mode':
      handleProcessState(elements, value, i18n);
      break;
    case 'contents.feeds':
      renderFeed(elements, value, i18n);
      break;
    case 'contents.posts':
      renderPosts(elements, value, i18n, state);
      break;
    case 'contents.activePost':
      openHolder(value, state, elements);
      break;
    default:
      break;
  }
};
