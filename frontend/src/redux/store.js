import { configureStore } from "@reduxjs/toolkit";

import productReducer from "./slices/productSlice";
import uiReducer from "./slices/uiSlice";
import cartReducer from "./slices/cartSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
    reducer: {
        products: productReducer,
        ui: uiReducer,
        cart: cartReducer,
        auth: authReducer,
    },
});
