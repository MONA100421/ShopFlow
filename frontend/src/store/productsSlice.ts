import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../types/Product";
import { getProducts } from "../services/productService";

/* ======================================================
   Async thunk：取得商品（目前走 localStorage / mock）
====================================================== */
export const fetchProducts = createAsyncThunk<Product[]>(
  "products/fetchProducts",
  async () => {
    const products = await getProducts();
    return products;
  }
);

/* ======================================================
   State 型別
====================================================== */
interface ProductsState {
  list: Product[];
  loading: boolean;
  error: string | null;
}

/* ======================================================
   localStorage helpers（非常關鍵）
====================================================== */
const STORAGE_KEY = "products";

const loadProductsFromStorage = (): Product[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? (JSON.parse(data) as Product[]) : [];
  } catch {
    return [];
  }
};

const saveProductsToStorage = (products: Product[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

/* ======================================================
   Initial State
====================================================== */
const initialState: ProductsState = {
  list: loadProductsFromStorage(), // 🔑 重新整理不會消失
  loading: false,
  error: null,
};

/* ======================================================
   Slice
====================================================== */
const productsSlice = createSlice({
  name: "products",
  initialState,

  reducers: {
    /* ===============================
       Add Product（你現在最需要）
    =============================== */
    addProduct: (state, action: PayloadAction<Product>) => {
      state.list.push(action.payload);
      saveProductsToStorage(state.list);
    },

    /* ===============================
       Remove Product
    =============================== */
    removeProduct: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(
        (product) => product.id !== action.payload
      );
      saveProductsToStorage(state.list);
    },

    /* ===============================
       Update Product
    =============================== */
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.list.findIndex(
        (product) => product.id === action.payload.id
      );

      if (index !== -1) {
        state.list[index] = action.payload;
        saveProductsToStorage(state.list);
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;

        /**
         * ⚠️ 關鍵設計說明：
         * 若 localStorage 已有資料，不要覆蓋
         * 避免 Add Product 後又被 fetch 清掉
         */
        if (state.list.length === 0) {
          state.list = action.payload;
          saveProductsToStorage(state.list);
        }
      })

      .addCase(fetchProducts.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load products";
      });
  },
});

/* ======================================================
   Exports
====================================================== */
export const { addProduct, removeProduct, updateProduct } =
  productsSlice.actions;

export default productsSlice.reducer;
