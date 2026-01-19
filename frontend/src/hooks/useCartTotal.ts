// src/hooks/useCartTotal.ts
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

const DISCOUNT_CODE = "20 DOLLAR OFF";
const DISCOUNT_AMOUNT = 20;
const TAX_RATE = 0.1;

export function useCartTotal() {
  const items = useSelector(
    (state: RootState) => state.cart.items
  );

  const [discountInput, setDiscountInput] =
    useState("");
  const [discountApplied, setDiscountApplied] =
    useState(false);

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + (item.subtotal ?? 0),
      0
    );
  }, [items]);

  const tax = useMemo(() => {
    return subtotal * TAX_RATE;
  }, [subtotal]);

  const discount = discountApplied
    ? DISCOUNT_AMOUNT
    : 0;

  const total = Math.max(
    subtotal + tax - discount,
    0
  );

  const applyDiscount = () => {
    setDiscountApplied(
      discountInput.trim().toUpperCase() ===
        DISCOUNT_CODE
    );
  };

  return {
    /* values */
    subtotal,
    tax,
    discount,
    total,

    /* discount state */
    discountInput,
    setDiscountInput,
    discountApplied,
    applyDiscount,
  };
}
