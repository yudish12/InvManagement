const generateFormError = (code, field, message) => {
  return {
    code,
    field,
    message,
  };
};

module.exports = {
  generateFormError,
};
