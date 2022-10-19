export const renderErrors = (elements, errors, prevErrors) => {
  Object.entries(elements.fields).forEach(([fieldName, fieldElement]) => {
    const error = errors[fieldName];
    const feedbackEl = elements.form.nextElementSibling.nextElementSibling;

    const fieldHadError = _.has(prevErrors, fieldName);
    const fieldHasError = _.has(errors, fieldName);
    if (!fieldHadError && !fieldHasError) {
      return;
    }
    if (fieldHadError && !fieldHasError) {
      fieldElement.classList.remove('is-invalid');
      feedbackEl.textContent = '';
      return;
    }
    if (fieldHadError && fieldHasError) {
      feedbackEl.textContent = error.message;
      return;
    }

    fieldElement.classList.add('is-invalid');
    feedbackEl.textContent = error.message;
  });
};

export const handleProcessState = (elements, value) => {};