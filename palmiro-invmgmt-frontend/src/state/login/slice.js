import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  requesting: false,
  success: false,
  error: null,
};

const loginSlice = createSlice({
  name: "login",
  initialState: initialState,
  reducers: {
    login: (state) => {
      state = { ...initialState, requesting: true };
      return state;
    },
    loginSuccess: (state) => {
      state = { ...initialState, success: true };
      return state;
    },
    loginError: (state, action) => {
      state = { ...initialState, error: action.payload };
      return state;
    },
    loginInit: (state) => {
      state = { ...initialState };
      return state;
    },
  },
});

export const { login, loginSuccess, loginError, loginInit } = loginSlice.actions;

export default loginSlice.reducer;
