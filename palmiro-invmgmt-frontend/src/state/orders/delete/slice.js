import { createSlice } from "@reduxjs/toolkit";
import cloneDeep from "lodash/cloneDeep";

const initialState = {
  requesting: {},
  success: {},
  error: {},
};

const slice = createSlice({
  name: "orders-delete",
  initialState: initialState,
  reducers: {
    deleteOrder: (state, action) => {
      const _state = cloneDeep(state);
      _state["requesting"][action.payload.orderId] = true;
      _state["success"][action.payload.orderId] = false;
      _state["error"][action.payload.orderId] = null;
      return _state;
    },
    deleteOrderSuccess: (state, action) => {
      const _state = cloneDeep(state);
      _state["requesting"][action.payload.orderId] = false;
      _state["success"][action.payload.orderId] = true;
      _state["error"][action.payload.orderId] = null;
      return _state;
    },
    deleteOrderError: (state, action) => {
      const _state = cloneDeep(state);
      _state["requesting"][action.payload.orderId] = false;
      _state["success"][action.payload.orderId] = false;
      _state["error"][action.payload.orderId] = action.payload.error;
      return _state;
    },
  },
});

export const { deleteOrder, deleteOrderSuccess, deleteOrderError } = slice.actions;

export default slice.reducer;
