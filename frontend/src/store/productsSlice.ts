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
import {
  fetchUserCartThunk,
  fetchGuestCartThunk,
} from "./cartSlice";
import type { RootState } from "./store";


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

/** GET /api/products/:id */
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
  Omit<Product, "id" | "createdAt">,
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
  {
    rejectValue: string;
    state: RootState;
  }
>("products/delete", async (productId, thunkAPI) => {
  const { rejectWithValue, dispatch, getState } = thunkAPI;

  try {
    await deleteProductAPI(productId);
    
    const isAuthenticated =
      getState().auth.isAuthenticated;

    if (isAuthenticated) {
      dispatch(fetchUserCartThunk());
    } else {
      dispatch(fetchGuestCartThunk());
    }

    return productId;
  } catch {
    return rejectWithValue("Delete product failed");
  }
});


/* State */

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

/* Slice */

const productsSlice = createSlice({
  name: "products",
  initialState,

  reducers: {
    clearProducts(state) {
      state.list = [];
      state.initialized = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
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
            state.list[index] = action.payload;
          } else {
            state.list.push(action.payload);
          }
        }
      )
      .addCase(fetchProductByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? "Failed to load product";
      })
      .addCase(createProductThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createProductThunk.fulfilled,
        (state, action: PayloadAction<Product>) => {
          state.loading = false;
          state.list.unshift(action.payload);
        }
      )
      .addCase(createProductThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? "Create product failed";
      })
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
          }
        }
      )
      .addCase(updateProductThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? "Update product failed";
      })
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
        }
      )
      .addCase(deleteProductThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? "Delete product failed";
      });
  },
});

export const { clearProducts } = productsSlice.actions;
export default productsSlice.reducer;
