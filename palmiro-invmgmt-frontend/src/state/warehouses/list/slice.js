import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  requesting: false,
  items: null,
  error: null,
};

const slice = createSlice({
  name: "warehouses-list",
  initialState: initialState,
  reducers: {
    listWarehouses: (state) => {
      state = { ...initialState, requesting: true };
      return state;
    },
    listWarehousesSuccess: (state, action) => {
      state = { ...initialState, items: action.payload };
      return state;
    },
    listWarehousesError: (state, action) => {
      state = { ...initialState, error: action.payload };
      return state;
    },
    listWarehousesInit: (state) => {
      state = { ...initialState };
      return state;
    },
  },
});

export const { listWarehouses, listWarehousesSuccess, listWarehousesError, listWarehousesInit } = slice.actions;

export default slice.reducer;
