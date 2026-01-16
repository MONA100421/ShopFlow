import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";
import type { Product } from "../types/Product";
import {
  getProducts,
  getProductById,
  createProductAPI,
  updateProductAPI,
  deleteProductAPI,
} from "../services/productService";

/* ======================================================
   Async Thunks
====================================================== */

/** GET /api/products */
export const fetchProductsThunk = createAsyncThunk<
  Product[],
  void,
  { rejectValue: string }
>("products/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await getProducts();
  } catch {
    return rejectWithValue("Failed to load products");
  }
});

/** GET /api/products/:id ✅ NEW */
export const fetchProductByIdThunk = createAsyncThunk<
  Product,
  string,
  { rejectValue: string }
>("products/fetchById", async (id, { rejectWithValue }) => {
  try {
    return await getProductById(id);
  } catch {
    return rejectWithValue("Failed to load product");
  }
});

/** POST /api/products */
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

/** PUT /api/products/:id */
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

/** DELETE /api/products/:id */
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
  list: [],
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
    clearProducts(state) {
      state.list = [];
      state.initialized = false;
    },
  },

  extraReducers: (builder) => {
    builder

      /* =====================
         Fetch All Products
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
        }
      )
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? "Failed to load products";
      })

      /* =====================
         Fetch Product By Id ✅
      ====================== */
      .addCase(fetchProductByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProductByIdThunk.fulfilled,
        (state, action: PayloadAction<Product>) => {
          state.loading = false;

          const index = state.list.findIndex(
            (p) => p.id === action.payload.id
          );

          if (index !== -1) {
            // 已存在 → 更新
            state.list[index] = action.payload;
          } else {
            // 不存在 → 加入
            state.list.push(action.payload);
          }
        }
      )
      .addCase(fetchProductByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? "Failed to load product";
      })

      /* =====================
         Create / Update / Delete
      ====================== */
      .addCase(createProductThunk.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })

      .addCase(updateProductThunk.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })

      .addCase(deleteProductThunk.fulfilled, (state, action) => {
        state.list = state.list.filter(
          (p) => p.id !== action.payload
        );
      });
  },
});

/* ======================================================
   Exports
====================================================== */

export const { clearProducts } = productsSlice.actions;
export default productsSlice.reducer;
