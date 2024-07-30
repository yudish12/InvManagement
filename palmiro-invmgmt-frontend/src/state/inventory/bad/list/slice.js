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
    listBadInventory: (state) => {
      state = { ...initialState, requesting: true };
      return state;
    },
    listBadInventorySuccess: (state, action) => {
      state = { ...initialState, items: action.payload };
      return state;
    },
    listBadInventoryError: (state, action) => {
      state = { ...initialState, error: action.payload };
      return state;
    },
    listBadInventoryInit: (state) => {
      state = { ...initialState };
      return state;
    },
  },
});

export const { listBadInventory, listBadInventorySuccess, listBadInventoryError, listBadInventoryInit } = slice.actions;

export default slice.reducer;
