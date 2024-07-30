import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  requesting: false,
  items: null,
  error: null,
};

const slice = createSlice({
  name: "brands-list",
  initialState: initialState,
  reducers: {
    listBrands: (state) => {
      state = { ...initialState, requesting: true };
      return state;
    },
    listBrandsSuccess: (state, action) => {
      state = { ...initialState, items: action.payload };
      return state;
    },
    listBrandsError: (state, action) => {
      state = { ...initialState, error: action.payload };
      return state;
    },
    listBrandsInit: (state) => {
      state = { ...initialState };
      return state;
    },
  },
});

export const { listBrands, listBrandsSuccess, listBrandsError, listBrandsInit } = slice.actions;

export default slice.reducer;
