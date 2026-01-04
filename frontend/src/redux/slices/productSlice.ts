import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { API_BASE } from "../../config";
import type { RootState } from "../store";

/** ---------- Types ---------- */
export type Product = {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  category?: string;
  price?: number | string;
  stock?: number | string;
  image?: string;
  imageUrl?: string;
  createdAt?: string | number | Date;
  [k: string]: any;
};

export type ProductCreatePayload = {
  name: string;
  description?: string;
  category?: string;
  price?: number;
  stock?: number;
  image?: string;
  [k: string]: any;
};

export type ProductUpdateArg = {
  id: string;
  payload?: Partial<Product>;
  data?: Partial<Product>;
};

export type ProductsState = {
  // list
  items: Product[];
  loading: boolean;
  error: string;

  // detail
  current: Product | null;
  currentLoading: boolean;
  currentError: string;

  // save
  saving: boolean;
  saveError: string;
};

/** ---------- helpers ---------- */
function pickProduct(data: any): Product {
  // 兼容 {product:{...}} 或直接 {...}
  return (data?.product ?? data) as Product;
}

function pickProducts(data: any): Product[] {
  // 兼容 {products:[...]} 或直接 [...]
  if (Array.isArray(data)) return data as Product[];
  if (Array.isArray(data?.products)) return data.products as Product[];
  return [];
}

function getPid(p: Product | null | undefined): string {
  return String(p?._id ?? p?.id ?? "");
}

/** ---------- thunks ---------- */

// ✅ 列表：只从后端拉
export const fetchProducts = createAsyncThunk<
  Product[],
  void,
  { rejectValue: string }
>("products/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE}/api/products`);
    const data: any = await res.json().catch(() => ({}));
    if (!res.ok)
      return rejectWithValue(data?.message || "Fetch products failed");
    return pickProducts(data);
  } catch (e: any) {
    return rejectWithValue(e?.message || "Network error");
  }
});

// ✅ 创建：只往后端写（manager only）
export const createProduct = createAsyncThunk<
  Product,
  ProductCreatePayload,
  { state: RootState; rejectValue: string }
>("products/create", async (payload, { getState, rejectWithValue }) => {
  try {
    const token = getState()?.auth?.token || localStorage.getItem("token") || "";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const resp = await fetch(`${API_BASE}/api/products`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data: any = await resp.json().catch(() => ({}));
    if (!resp.ok)
      return rejectWithValue(data?.message || "Create product failed");
    return pickProduct(data);
  } catch (e: any) {
    return rejectWithValue(e?.message || "Network error");
  }
});

// ✅ 详情：给 ProductDetail / EditProduct 加载用
export const fetchProductById = createAsyncThunk<
  Product,
  string,
  { rejectValue: string }
>("products/fetchById", async (id, { rejectWithValue }) => {
  try {
    const resp = await fetch(`${API_BASE}/api/products/${id}`);
    const data: any = await resp.json().catch(() => ({}));
    if (!resp.ok)
      return rejectWithValue(data?.message || "Load product failed");
    return pickProduct(data);
  } catch (e: any) {
    return rejectWithValue(e?.message || "Network error");
  }
});

export const deleteProduct = createAsyncThunk<
  string, // return deleted id
  string, // arg: id
  { state: RootState; rejectValue: string }
>("products/delete", async (id, { getState, rejectWithValue }) => {
  try {
    const token =
      (getState() as any)?.auth?.token || localStorage.getItem("token") || "";
    const clean = String(token)
      .trim()
      .replace(/^Bearer\s+/i, "")
      .replace(/^"(.*)"$/, "$1")
      .replace(/^'(.*)'$/, "$1");

    const resp = await fetch(`${API_BASE}/api/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${clean}`,
      },
    });

    const data: any = await resp.json().catch(() => ({}));
    if (!resp.ok) return rejectWithValue(data?.message || "Delete failed");
    return id;
  } catch (e: any) {
    return rejectWithValue(e?.message || "Network error");
  }
});

// ✅ 更新：给 EditProduct 保存用（manager only）
// 支持 {id, payload} 或 {id, data}
export const updateProduct = createAsyncThunk<
  Product,
  ProductUpdateArg,
  { state: RootState; rejectValue: string }
>(
  "products/update",
  async ({ id, payload, data }, { getState, rejectWithValue }) => {
    try {
      const bodyObj = (payload ?? data ?? {}) as Record<string, any>;
      const token =
        getState()?.auth?.token || localStorage.getItem("token") || "";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const resp = await fetch(`${API_BASE}/api/products/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(bodyObj),
      });

      const resData: any = await resp.json().catch(() => ({}));
      if (!resp.ok)
        return rejectWithValue(resData?.message || "Update product failed");
      return pickProduct(resData);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Network error");
    }
  }
);

/** ---------- slice ---------- */

const initialState: ProductsState = {
  // list
  items: [],
  loading: false,
  error: "",

  // detail
  current: null,
  currentLoading: false,
  currentError: "",

  // save
  saving: false,
  saveError: "",
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = null;
      state.currentLoading = false;
      state.currentError = "";
      state.saving = false;
      state.saveError = "";
    },
  },

  // ✅ 这里只修复括号/链式结构，不改逻辑
  extraReducers: (builder) => {
    builder
      // ----- list -----
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(
        fetchProducts.fulfilled,
        (state, action: PayloadAction<Product[]>) => {
          state.loading = false;
          state.items = action.payload || [];
        }
      )
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error?.message ||
          "Fetch failed";
      })

      // ✅ delete
      .addCase(deleteProduct.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = (state.items || []).filter(
          (p: any) => p?._id !== id && p?.id !== id
        );

        // 如果你有 selected/current 也顺手清
        if (
          (state as any).current?.id === id ||
          (state as any).current?._id === id
        ) {
          (state as any).current = null;
        }
      })

      // ----- create -----
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        const p = action.payload;
        if (!p) return;

        // 放到列表最前，同时避免重复
        const pid = getPid(p);
        state.items = [p, ...state.items.filter((x) => getPid(x) !== pid)];
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error?.message ||
          "Create failed";
      })

      // ----- detail load -----
      .addCase(fetchProductById.pending, (state) => {
        state.currentLoading = true;
        state.currentError = "";
        state.current = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action: PayloadAction<Product>) => {
        state.currentLoading = false;
        state.current = action.payload || null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.currentLoading = false;
        state.currentError =
          (action.payload as string) ||
          action.error?.message ||
          "Load failed";
      })

      // ----- update -----
      .addCase(updateProduct.pending, (state) => {
        state.saving = true;
        state.saveError = "";
      })
      .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.saving = false;
        const p = action.payload;
        if (!p) return;

        // 更新 current
        state.current = p;

        // 同步更新 items
        const pid = getPid(p);
        state.items = state.items.map((x) => (getPid(x) === pid ? p : x));
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.saving = false;
        state.saveError =
          (action.payload as string) ||
          action.error?.message ||
          "Update failed";
      });
  },
});

export const { clearCurrent } = productSlice.actions;
export default productSlice.reducer;
