import _ from 'lodash';

const openHolder = (elements, state) => {
  const { activePost, posts } = state.contents;
  const post = posts.find(({ id }) => id === activePost);
  const { titlePost, descriptionPost, linkPost } = post;

  const linkBtn = elements.modal.footer.querySelector('a.btn');
  elements.modal.title.textContent = titlePost;
  elements.modal.body.textContent = descriptionPost;
  linkBtn.href = linkPost;
};

const renderErrors = (elements, i18n, error) => {
  const rssElement = elements.fields.rss;
  const { feedbackEl } = elements;

  if (feedbackEl.classList.contains('text-success')) {
    feedbackEl.classList.remove('text-success');
  }
  feedbackEl.classList.add('text-danger');

  const isError = (error !== null);
  if (!isError) {
    rssElement.classList.remove('is-invalid');
    feedbackEl.textContent = '';
    return;
  }
  if (isError) {
    feedbackEl.textContent = i18n.t(`feedbackText.${error}`);
    return;
  }

  rssElement.classList.add('is-invalid');
  feedbackEl.textContent = i18n.t(`feedbackText.${error}`);
};

const handleProcessState = (elements, i18n, state) => {
  const { mode } = state.form;
  const { feedbackEl } = elements;

  switch (mode) {
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
      feedbackEl.textContent = i18n.t(`feedbackText.${mode}`);
      elements.fields.rss.value = '';
      elements.fields.rss.focus();
      break;
    default:
      break;
  }
};

const renderFeed = (elements, i18n, state) => {
  const { feeds } = state.contents;
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

const renderPosts = (elements, i18n, state) => {
  const { posts, viewedPosts } = state.contents;
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

    if (viewedPosts.includes(id)) {
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

export default (path, value, elements, i18n, state) => {
  switch (path) {
    case 'form.error':
      renderErrors(elements, i18n, value);
      break;
    case 'contents.error':
      renderErrors(elements, i18n, value);
      break;
    case 'form.mode':
      handleProcessState(elements, i18n, state);
      break;
    case 'contents.feeds':
      renderFeed(elements, i18n, state);
      break;
    case 'contents.posts':
      renderPosts(elements, i18n, state);
      break;
    case 'contents.viewedPosts': 
      renderPosts(elements, i18n, state);
      break;
    case 'contents.activePost':
      openHolder(elements, state);
      break;
    default:
      break;
  }
};
