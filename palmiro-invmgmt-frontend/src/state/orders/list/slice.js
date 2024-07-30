import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  requesting: false,
  items: null,
  error: null,
};

const slice = createSlice({
  name: "orders-list",
  initialState: initialState,
  reducers: {
    listOrders: (state) => {
      state = { ...initialState, requesting: true };
      return state;
    },
    listOrdersSuccess: (state, action) => {
      state = { ...initialState, items: action.payload };
      return state;
    },
    listOrdersError: (state, action) => {
      state = { ...initialState, error: action.payload };
      return state;
    },
    listOrdersInit: (state) => {
      state = { ...initialState };
      return state;
    },
  },
});

export const { listOrders, listOrdersSuccess, listOrdersError, listOrdersInit } = slice.actions;

export default slice.reducer;
