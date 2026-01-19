// src/components/QuantityButton.tsx
import "./QuantityButton.css";

interface QuantityButtonProps {
  quantity: number;
  onAdd: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  disabled?: boolean;
}

export default function QuantityButton({
  quantity,
  onAdd,
  onIncrease,
  onDecrease,
  disabled = false,
}: QuantityButtonProps) {
  // quantity === 0 → 顯示 Add
  if (quantity === 0) {
    return (
      <button
        type="button"
        className="qty-btn qty-btn--add"
        onClick={onAdd}
        disabled={disabled}
      >
        Add
      </button>
    );
  }

  // quantity > 0 → 顯示 - 1 +
  return (
    <div className="qty-btn qty-btn--counter">
      <button
        type="button"
        className="qty-btn__icon"
        onClick={onDecrease}
        disabled={disabled}
      >
        −
      </button>

      <span className="qty-btn__count">{quantity}</span>

      <button
        type="button"
        className="qty-btn__icon"
        onClick={onIncrease}
        disabled={disabled}
      >
        +
      </button>
    </div>
  );
}
