import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  requesting: false,
  items: null,
  error: null,
};

const slice = createSlice({
  name: "dashboard-instock-stats",
  initialState: initialState,
  reducers: {
    dashboardInstockStats: (state) => {
      state = { ...initialState, requesting: true };
      return state;
    },
    dashboardInstockStatsSuccess: (state, action) => {
      state = { ...initialState, items: action.payload };
      return state;
    },
    dashboardInstockStatsError: (state, action) => {
      state = { ...initialState, error: action.payload };
      return state;
    },
    dashboardInstockStatsInit: (state) => {
      state = { ...initialState };
      return state;
    },
  },
});

export const { dashboardInstockStats, dashboardInstockStatsSuccess, dashboardInstockStatsError, dashboardInstockStatsInit } = slice.actions;

export default slice.reducer;
