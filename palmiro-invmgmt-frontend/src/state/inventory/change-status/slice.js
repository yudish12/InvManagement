import { createSlice } from "@reduxjs/toolkit";
import cloneDeep from "lodash/cloneDeep";

const initialState = {
  requesting: {},
  success: {},
  error: {},
};

const slice = createSlice({
  name: "inventory-change-status",
  initialState: initialState,
  reducers: {
    changeInventoryStatus: (state, action) => {
      const _state = cloneDeep(state);
      _state["requesting"][action.payload.serialNumber] = true;
      _state["success"][action.payload.serialNumber] = false;
      _state["error"][action.payload.serialNumber] = null;
      return _state;
    },
    changeInventoryStatusSuccess: (state, action) => {
      const _state = cloneDeep(state);
      _state["requesting"][action.payload.serialNumber] = false;
      _state["success"][action.payload.serialNumber] = action.payload.data;
      _state["error"][action.payload.serialNumber] = null;
      return _state;
    },
    changeInventoryStatusError: (state, action) => {
      const _state = cloneDeep(state);
      _state["requesting"][action.payload.serialNumber] = false;
      _state["success"][action.payload.serialNumber] = false;
      _state["error"][action.payload.serialNumber] = action.payload.error;
      return _state;
    },
  },
});

export const { changeInventoryStatus, changeInventoryStatusSuccess, changeInventoryStatusError } = slice.actions;

export default slice.reducer;
