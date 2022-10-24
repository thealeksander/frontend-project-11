export const renderErrors = (elements, error, prevError, i18n) => {
  console.log(error);
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
  console.log(value);
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
  console.log(feeds);
  const { title, description } = feeds;
  const feedsIneer = `
    <h1 class="fs-4 fw-semibold mb-4">${i18n.t('feeds')}</h1>
    <div class="text-md-start m-0">
      <div class="fw-semibold m-0">${title}</div>
      <div class="small text-black-50 m-0">${description}</div>
    </div>
  `;
  elements.feeds.innerHTML = feedsIneer;
};

export const renderPosts = (elements, posts) => {

};