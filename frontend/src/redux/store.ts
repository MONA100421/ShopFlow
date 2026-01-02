// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import productReducer from "./slices/productSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productReducer,
    ui: uiReducer,
  },
});

// ✅ 全项目统一类型从这里出
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
