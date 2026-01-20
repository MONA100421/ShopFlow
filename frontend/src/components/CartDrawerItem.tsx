import ProductImage from "./ProductImage";
import { useCartItem } from "../hooks/useCartItem";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store/store";
import { removeFromCartThunk } from "../store/cartSlice";
import type { CartItem } from "../types/CartItem";

interface CartProduct {
  id: string;
  title: string;
  price: number;
  image: string;
  stock: number;
}

interface CartDrawerItemProps {
  item: CartItem;
}

export default function CartDrawerItem({
  item,
}: CartDrawerItemProps) {
  const dispatch = useDispatch<AppDispatch>();
  if (
    !item ||
    !item.productId ||
    typeof item.price !== "number"
  ) {
    return null;
  }

  const product: CartProduct = {
    id: item.productId,
    title: item.name,
    price: item.price,
    image: item.imageUrl,
    stock: Infinity,
  };

  const { quantity, increase, decrease } =
    useCartItem(product);

  return (
    <div className="drawer-item">
      <div className="drawer-item-image">
        <ProductImage
          src={item.imageUrl}
          alt={item.name}
        />
      </div>

      <div className="drawer-item-main">
        <div className="drawer-item-name">
          {item.name}
        </div>

        <div className="cart-qty-control">
          <button
            className="cart-qty-btn minus"
            onClick={decrease}
            aria-label="Decrease quantity"
          >
            -
          </button>

          <span className="cart-qty-count">
            {quantity}
          </span>

          <button
            className="cart-qty-btn plus"
            onClick={increase}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="drawer-item-side">
        <div className="drawer-item-price">
          ${(item.subtotal ?? 0).toFixed(2)}
        </div>

        <button
          className="cart-remove-btn"
          onClick={() =>
            dispatch(
              removeFromCartThunk(item.productId)
            )
          }
        >
          Remove
        </button>
      </div>
    </div>
  );
}
