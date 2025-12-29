import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = "http://localhost:5001";

// ✅ 只从后端拉
export const fetchProducts = createAsyncThunk("products/fetch", async () => {
    const res = await fetch(`${API_BASE}/api/products`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Fetch products failed");
    return Array.isArray(data?.products) ? data.products : [];
});

// ✅ 只往后端写
export const createProduct = createAsyncThunk("products/create", async (payload) => {
    const token = localStorage.getItem("token");

    const headers = { "Content-Type": "application/json" };
    // 有 token 才带（避免 Bearer null）
    if (token) headers.Authorization = `Bearer ${token}`;

    const resp = await fetch(`${API_BASE}/api/products`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data?.message || "Create product failed");
    return data;
});

const productSlice = createSlice({
    name: "products",
    initialState: {
        items: [],
        loading: false,
        error: "",
    },
    reducers: {
        // ✅ 本地假数据相关 reducer 全删掉
    },
    extraReducers: (builder) => {
        // ---------- fetchProducts ----------
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = "";
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload || [];
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error?.message || "Fetch failed";
            });

        // ---------- createProduct ----------
        builder
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
                state.error = "";
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading = false;
                // ✅ 创建成功后插到最前面（可选，但非常好用）
                if (action.payload) state.items.unshift(action.payload);
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error?.message || "Create failed";
            });
    },
});

export default productSlice.reducer;
