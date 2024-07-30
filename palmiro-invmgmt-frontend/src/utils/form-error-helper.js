export const generateFormError = (code, field, message) => {
  return {
    code,
    field,
    message,
  };
};

export const defaultFormErrorHandler = (err) => {
  if (err?.response?.status === 404) {
    return {
      code: "FORM_ERROR",
      message: "Server unreachable",
    };
  }

  if (err?.response?.data?.message && !err?.response?.data?.code) {
    return {
      code: "FORM_ERROR",
      message: err.response.data.message,
    };
  }

  if (err?.response?.data) {
    if (typeof err.response.data === "string") {
      return {
        code: "FORM_ERROR",
        message: err.response.data,
      };
    }
    return err.response.data;
  }
  return err;
};
