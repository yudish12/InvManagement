import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  requesting: false,
  items: null,
  error: null,
};

const slice = createSlice({
  name: "partcode-list",
  initialState: initialState,
  reducers: {
    listPartCode: (state) => {
      state = { ...initialState, requesting: true };
      return state;
    },
    listPartCodeSuccess: (state, action) => {
      state = { ...initialState, items: action.payload };
      return state;
    },
    listPartCodeError: (state, action) => {
      state = { ...initialState, error: action.payload };
      return state;
    },
    listPartCodeInit: (state) => {
      state = { ...initialState };
      return state;
    },
  },
});

export const { listPartCode, listPartCodeSuccess, listPartCodeError, listPartCodeInit } = slice.actions;

export default slice.reducer;
