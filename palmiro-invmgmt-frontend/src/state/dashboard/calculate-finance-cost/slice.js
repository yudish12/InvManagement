import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  requesting: false,
  items: null,
  error: null,
};

const slice = createSlice({
  name: "dashboard-calc-fin-cost",
  initialState: initialState,
  reducers: {
    dashboardCalcFinanceCost: (state) => {
      state = { ...initialState, requesting: true };
      return state;
    },
    dashboardCalcFinanceCostSuccess: (state, action) => {
      state = { ...initialState, items: action.payload };
      return state;
    },
    dashboardCalcFinanceCostError: (state, action) => {
      state = { ...initialState, error: action.payload };
      return state;
    },
  },
});

export const { dashboardCalcFinanceCost, dashboardCalcFinanceCostSuccess, dashboardCalcFinanceCostError } = slice.actions;

export default slice.reducer;
