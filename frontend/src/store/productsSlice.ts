import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";
import type { Product } from "../types/Product";
import {
  getProducts,
  createProductAPI,
  updateProductAPI,
  deleteProductAPI,
} from "../services/productService";

/* ======================================================
   Local Cache (Demo only, removable later)
====================================================== */

const STORAGE_KEY = "products_cache";

const loadCache = (): Product[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
};

const saveCache = (products: Product[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

/* ======================================================
   Async Thunks (API-first)
====================================================== */

/** GET /api/products */
export const fetchProductsThunk = createAsyncThunk<
  Product[],
  void,
  { rejectValue: string }
>("products/fetch", async (_, { rejectWithValue }) => {
  try {
    return await getProducts();
  } catch {
    return rejectWithValue("Failed to load products");
  }
});

/** POST /api/products (admin) */
export const createProductThunk = createAsyncThunk<
  Product,
  Product,
  { rejectValue: string }
>("products/create", async (product, { rejectWithValue }) => {
  try {
    return await createProductAPI(product);
  } catch {
    return rejectWithValue("Create product failed");
  }
});

/** PUT /api/products/:id (admin) */
export const updateProductThunk = createAsyncThunk<
  Product,
  Product,
  { rejectValue: string }
>("products/update", async (product, { rejectWithValue }) => {
  try {
    return await updateProductAPI(product);
  } catch {
    return rejectWithValue("Update product failed");
  }
});

/** DELETE /api/products/:id (admin) */
export const deleteProductThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("products/delete", async (productId, { rejectWithValue }) => {
  try {
    await deleteProductAPI(productId);
    return productId;
  } catch {
    return rejectWithValue("Delete product failed");
  }
});

/* ======================================================
   State
====================================================== */

interface ProductsState {
  list: Product[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: ProductsState = {
  list: loadCache(), // demo / refresh only
  loading: false,
  error: null,
  initialized: false,
};

/* ======================================================
   Slice
====================================================== */

const productsSlice = createSlice({
  name: "products",
  initialState,

  reducers: {
    /** 清空商品（例如 logout） */
    clearProducts(state) {
      state.list = [];
      state.initialized = false;
      localStorage.removeItem(STORAGE_KEY);
    },
  },

  extraReducers: (builder) => {
    builder

      /* =====================
         Fetch Products
      ====================== */
      .addCase(fetchProductsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProductsThunk.fulfilled,
        (state, action: PayloadAction<Product[]>) => {
          state.loading = false;
          state.list = action.payload;
          state.initialized = true;
          saveCache(state.list);
        }
      )
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load products";
      })

      /* =====================
         Create Product
      ====================== */
      .addCase(createProductThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createProductThunk.fulfilled,
        (state, action: PayloadAction<Product>) => {
          state.loading = false;
          state.list.unshift(action.payload);
          saveCache(state.list);
        }
      )
      .addCase(createProductThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Create product failed";
      })

      /* =====================
         Update Product
      ====================== */
      .addCase(updateProductThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateProductThunk.fulfilled,
        (state, action: PayloadAction<Product>) => {
          state.loading = false;
          const index = state.list.findIndex(
            (p) => p.id === action.payload.id
          );
          if (index !== -1) {
            state.list[index] = action.payload;
            saveCache(state.list);
          }
        }
      )
      .addCase(updateProductThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Update product failed";
      })

      /* =====================
         Delete Product
      ====================== */
      .addCase(deleteProductThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteProductThunk.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.list = state.list.filter(
            (p) => p.id !== action.payload
          );
          saveCache(state.list);
        }
      )
      .addCase(deleteProductThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Delete product failed";
      });
  },
});

/* ======================================================
   Exports
====================================================== */

export const { clearProducts } = productsSlice.actions;
export default productsSlice.reducer;
