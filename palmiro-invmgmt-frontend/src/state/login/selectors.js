import get from "lodash/get";

export const isRequestingLogin = (state) => get(state, "login.requesting", false);

export const getLoginSuccess = (state) => get(state, "login.success", false);

export const getLoginError = (state) => get(state, "login.error", null);
