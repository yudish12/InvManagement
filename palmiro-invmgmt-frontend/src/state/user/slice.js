import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    data: null,
  },
  reducers: {
    userReceive: (state, action) => {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
});

export const { userReceive } = userSlice.actions;

export default userSlice.reducer;
