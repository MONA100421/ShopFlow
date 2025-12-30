import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE } from "../config";

// --- helpers ---
function pickProduct(data) {
    // 兼容 {product:{...}} 或直接 {...}
    return data?.product ?? data;
}
function pickProducts(data) {
    // 兼容 {products:[...]} 或直接 [...]
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.products)) return data.products;
    return [];
}

// ✅ 列表：只从后端拉
export const fetchProducts = createAsyncThunk(
    "products/fetch",
    async (_, { rejectWithValue }) => {
        try {
            const res = await fetch(`${API_BASE}/api/products`);
            const data = await res.json().catch(() => ({}));
            if (!res.ok) return rejectWithValue(data?.message || "Fetch products failed");
            return pickProducts(data);
        } catch (e) {
            return rejectWithValue(e?.message || "Network error");
        }
    }
);

// ✅ 创建：只往后端写（manager only）
export const createProduct = createAsyncThunk(
    "products/create",
    async (payload, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const headers = { "Content-Type": "application/json" };
            if (token) headers.Authorization = `Bearer ${token}`;

            const resp = await fetch(`${API_BASE}/api/products`, {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            });

            const data = await resp.json().catch(() => ({}));
            if (!resp.ok) return rejectWithValue(data?.message || "Create product failed");
            return pickProduct(data);
        } catch (e) {
            return rejectWithValue(e?.message || "Network error");
        }
    }
);

// ✅ 详情：给 ProductDetail / EditProduct 加载用
export const fetchProductById = createAsyncThunk(
    "products/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const resp = await fetch(`${API_BASE}/api/products/${id}`);
            const data = await resp.json().catch(() => ({}));
            if (!resp.ok) return rejectWithValue(data?.message || "Load product failed");
            return pickProduct(data);
        } catch (e) {
            return rejectWithValue(e?.message || "Network error");
        }
    }
);

// ✅ 更新：给 EditProduct 保存用（manager only）
export const updateProduct = createAsyncThunk(
    "products/update",
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const headers = { "Content-Type": "application/json" };
            if (token) headers.Authorization = `Bearer ${token}`;

            const resp = await fetch(`${API_BASE}/api/products/${id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(payload),
            });

            const data = await resp.json().catch(() => ({}));
            if (!resp.ok) return rejectWithValue(data?.message || "Update product failed");
            return pickProduct(data);
        } catch (e) {
            return rejectWithValue(e?.message || "Network error");
        }
    }
);

const productSlice = createSlice({
    name: "products",
    initialState: {
        // list
        items: [],
        loading: false,
        error: "",

        // detail
        current: null,
        currentLoading: false,
        currentError: "",
    },
    reducers: {
        clearCurrent(state) {
            state.current = null;
            state.currentLoading = false;
            state.currentError = "";
        },
    },
    extraReducers: (builder) => {
        // ----- list -----
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
                state.error = action.payload || action.error?.message || "Fetch failed";
            });

        // ----- create -----
        builder
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
                state.error = "";
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading = false;
                const p = action.payload;
                if (!p) return;

                // 放到列表最前，同时避免重复
                const pid = String(p?._id ?? p?.id ?? "");
                state.items = [
                    p,
                    ...state.items.filter((x) => String(x?._id ?? x?.id ?? "") !== pid),
                ];
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error?.message || "Create failed";
            });

        // ----- detail load -----
        builder
            .addCase(fetchProductById.pending, (state) => {
                state.currentLoading = true;
                state.currentError = "";
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.currentLoading = false;
                state.current = action.payload || null;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.currentLoading = false;
                state.currentError = action.payload || action.error?.message || "Load failed";
            });

        // ----- update -----
        builder
            .addCase(updateProduct.pending, (state) => {
                state.currentLoading = true;
                state.currentError = "";
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.currentLoading = false;
                const p = action.payload;
                if (!p) return;

                // 更新 current
                state.current = p;

                // 同步更新 items
                const pid = String(p?._id ?? p?.id ?? "");
                state.items = state.items.map((x) =>
                    String(x?._id ?? x?.id ?? "") === pid ? p : x
                );
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.currentLoading = false;
                state.currentError = action.payload || action.error?.message || "Update failed";
            });
    },
});

export const { clearCurrent } = productSlice.actions;
export default productSlice.reducer;
