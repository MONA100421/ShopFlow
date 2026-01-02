import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    search: "",      // 搜索词
    cartOpen: false, // 先预留：以后你要做 cart 浮窗/抽屉也能放这里
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setSearch(state, action) {
            state.search = action.payload ?? "";
        },
        openCart(state) {
            state.cartOpen = true;
        },
        closeCart(state) {
            state.cartOpen = false;
        },
    },
});

export const { setSearch, openCart, closeCart } = uiSlice.actions;
export default uiSlice.reducer;
