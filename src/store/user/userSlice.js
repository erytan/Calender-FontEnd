import { createSlice } from "@reduxjs/toolkit";
import * as action from "./asyncAction";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: {
      firstname: "",
      lastname: "",
    },
    isLoggedIn: false,
    current: null,
    token: null,
    isLoading: false,
  },
  reducers: {
    register: (state, action) => {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.userData = action.payload.userData; // Update userData instead of current
      state.token = action.payload.token;
    },
    login: (state, action) => {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.token = null;
        state.userData = null; // Clear userData on logout if needed
        state.current = null;
    },
    updateCurrentUser: (state, action) => {
      state.current = { ...state.current, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(action.getCurrent.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(action.getCurrent.fulfilled, (state, action) => {
      state.isLoading = false;
      state.current = action.payload;
    });
    builder.addCase(action.getCurrent.rejected, (state, action) => {
      state.isLoading = false;
      state.current = null;
      state.isLoggedIn = false;
      state.token = null;
    });
  },
});

export const { register, login, logout,updateCurrentUser } = userSlice.actions;
export default userSlice.reducer;