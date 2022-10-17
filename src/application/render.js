export const renderErrors = (elements, errors, prevErrors) => {
  Object.entries(elements.fields).forEach(([fieldName, fieldElement]) => {
    console.log(errors[fieldName]);
  });
};

export const handleProcessState = (elements, value) => {};