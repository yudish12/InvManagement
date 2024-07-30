import axios from "axios";

const USER_TOKEN_LOCAL_STORAGE_KEY = "token";

export const getUserToken = () => {
  return localStorage.getItem(USER_TOKEN_LOCAL_STORAGE_KEY);
};

export const setUserToken = (token) => {
  return localStorage.setItem(USER_TOKEN_LOCAL_STORAGE_KEY, token);
};

export const logoutUser = () => {
  localStorage.removeItem(USER_TOKEN_LOCAL_STORAGE_KEY);
  window.location.href = "/";
};
