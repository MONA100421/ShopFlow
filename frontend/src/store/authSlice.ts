import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { User } from "../services/authService";
import {
  loginAPI,
  registerAPI,
  logoutAPI,
  meAPI,
} from "../services/authService";
import { mergeCartAPI } from "../services/cartService";
import { getGuestCart, clearGuestCart } from "../utils/guestCart";
import {
  fetchUserCartThunk,
  fetchGuestCartThunk,
} from "./cartSlice";

/* State */

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  initialized: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  initialized: false,
  loading: false,
  error: null,
};

/* Thunks */

export const loginThunk = createAsyncThunk<
  User | null,
  { email: string; password: string },
  { dispatch: any }
>("auth/login", async (payload, { dispatch }) => {
  await loginAPI(payload);

  const guestItems = getGuestCart();
  if (guestItems.length > 0) {
    await mergeCartAPI(
      guestItems.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      }))
    );
    clearGuestCart();
  }

  await dispatch(fetchUserCartThunk()).unwrap();
  return await meAPI();
});

export const registerThunk = createAsyncThunk<
  User | null,
  { email: string; password: string },
  { dispatch: any }
>("auth/register", async (payload, { dispatch }) => {
  await registerAPI(payload);
  return dispatch(loginThunk(payload)).unwrap();
});

export const restoreAuthThunk = createAsyncThunk<
  User | null,
  void,
  { dispatch: any }
>("auth/restore", async (_, { dispatch }) => {
  const user = await meAPI();

  if (user) {
    await dispatch(fetchUserCartThunk()).unwrap();
  } else {
    await dispatch(fetchGuestCartThunk()).unwrap();
  }

  return user;
});

export const logoutThunk = createAsyncThunk<
  void,
  void,
  { dispatch: any }
>("auth/logout", async (_, { dispatch }) => {
  await logoutAPI();
  await dispatch(fetchGuestCartThunk()).unwrap();
});


/* Slice */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.initialized = true;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.initialized = true;
      })
      .addCase(restoreAuthThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.initialized = true;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.initialized = true;
      });
  },
});

export default authSlice.reducer;
