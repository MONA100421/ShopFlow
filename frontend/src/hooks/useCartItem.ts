import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import {
  addToCartThunk,
  updateQuantityThunk,
  removeFromCartThunk,
} from "../store/cartSlice";
import type { Product } from "../types/Product";

export function useCartItem(product: Product) {
  const dispatch = useDispatch<AppDispatch>();

  const cartItem = useSelector((state: RootState) =>
    state.cart.items.find(
      (item) => item.productId === product.id
    )
  );

  const quantity = cartItem?.quantity ?? 0;
  const isOutOfStock = product.stock === 0;
  const isMaxReached = quantity >= product.stock;

  const add = () => {
    if (isOutOfStock) return;

    dispatch(
      addToCartThunk({
        productId: product.id,
        name: product.title,
        price: product.price,
        imageUrl: product.image,
        quantity: 1,
        subtotal: product.price,
      })
    );
  };

  const increase = () => {
    if (isOutOfStock || isMaxReached) return;

    dispatch(
      updateQuantityThunk({
        productId: product.id,
        delta: 1,
      })
    );
  };

  const decrease = () => {
    if (quantity <= 1) {
      dispatch(removeFromCartThunk(product.id));
    } else {
      dispatch(
        updateQuantityThunk({
          productId: product.id,
          delta: -1,
        })
      );
    }
  };

  return {
    quantity,
    isOutOfStock,
    isMaxReached,
    add,
    increase,
    decrease,
  };
}
