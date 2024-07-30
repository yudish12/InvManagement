import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  requesting: false,
  success: false,
  error: null,
};

const slice = createSlice({
  name: "common-add",
  initialState: initialState,
  reducers: {
    add: (state) => {
      state = { ...initialState, requesting: true };
      return state;
    },
    addSuccess: (state) => {
      state = { ...initialState, success: true };
      return state;
    },
    addError: (state, action) => {
      state = { ...initialState, error: action.payload };
      return state;
    },
    addInit: (state) => {
      state = { ...initialState };
      return state;
    },
  },
});

export const { add, addSuccess, addError, addInit } = slice.actions;

export default slice.reducer;
