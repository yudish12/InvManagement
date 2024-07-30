import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  requesting: false,
  items: null,
  error: null,
};

const slice = createSlice({
  name: "inventory-list",
  initialState: initialState,
  reducers: {
    listInventory: (state) => {
      state = { ...initialState, requesting: true };
      return state;
    },
    listInventorySuccess: (state, action) => {
      state = { ...initialState, items: action.payload.items, count: action.payload.count };
      return state;
    },
    listInventoryError: (state, action) => {
      state = { ...initialState, error: action.payload };
      return state;
    },
    listInventoryInit: (state) => {
      state = { ...initialState };
      return state;
    },
  },
});

export const { listInventory, listInventorySuccess, listInventoryError, listInventoryInit } = slice.actions;

export default slice.reducer;
