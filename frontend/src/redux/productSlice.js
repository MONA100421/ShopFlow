import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = "http://localhost:5001";

// ✅ 可选：后面接后端时会用到（现在你也可以先不用调用）
export const fetchProducts = createAsyncThunk("products/fetch", async () => {
    const resp = await fetch(`${API_BASE}/api/products`);
    const data = await resp.json().catch(() => ([]));
    if (!resp.ok) throw new Error(data?.message || "Fetch products failed");

    // 兼容：后端可能返回 { products: [...] } 或直接返回 [...]
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.products)) return data.products;
    return [];
});

// ✅ 可选：后面接后端时会用到（现在你也可以先不用调用）
export const createProduct = createAsyncThunk(
    "products/create",
    async (payload) => {
        const token = localStorage.getItem("token");
        const resp = await fetch(`${API_BASE}/api/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(data?.message || "Create product failed");
        return data;
    }
);

const productSlice = createSlice({
    name: "products",
    initialState: {
        items: [],
        loading: false,
        error: "",
    },

    reducers: {
        // ✅ 纯前端：新增 product（不走后端）
        addLocalProduct: (state, action) => {
            state.items.unshift(action.payload);
        },

        // ✅ 清空所有产品（你说要清掉随便放的）
        clearProducts: (state) => {
            state.items = [];
        },
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
                state.items = action.payload;
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

                // 后端返回新 product 时，把它插到最前面（可选）
                if (action.payload) state.items.unshift(action.payload);
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error?.message || "Create failed";
            });
    },
});

export const { addLocalProduct, clearProducts } = productSlice.actions;
export default productSlice.reducer;
