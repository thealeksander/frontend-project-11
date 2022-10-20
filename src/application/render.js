export const renderErrors = (elements, error, prevError) => {
  const rssElement = elements.fields.rss;
  const feedbackEl = elements.feedbackEl;

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
    feedbackEl.textContent = error;
    return;
  }

  rssElement.classList.add('is-invalid');
  feedbackEl.textContent = error;
};

export const handleProcessState = (elements, value) => {
  switch (value) {
    case 'sending':
      elements.submitButton.disabled = true;
      break;
    case 'sent':
      elements.submitButton.disabled = false;
      break;
    default:
      break;
  }
};