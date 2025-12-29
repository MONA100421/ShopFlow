import { useCart } from "../context/CartContext";

interface CartDrawerProps {
 open: boolean;
 onClose: () => void;
}

export default function CartDrawer({
 open,
 onClose,
}: CartDrawerProps) {
 const {
   items,
   updateQuantity,
   removeFromCart,
   subtotal,
   tax,
   discount,
   total,
   applyDiscountCode,
 } = useCart();

 return (
   <>
     {/* Overlay */}
     {open && (
       <div
         className="cart-overlay"
         onClick={onClose}
       />
     )}

     {/* Drawer */}
     <aside
       className={`cart-drawer ${open ? "open" : ""}`}
     >
       {/* Header */}
       <div className="cart-drawer-header">
         <h2>
           Cart <span>({items.length})</span>
         </h2>

       <button
           className="cart-close-btn"
           onClick={onClose}
           aria-label="Close cart"
       >
           ✕
       </button>

       </div>

       {/* Content */}
       <div className="cart-drawer-content">
         {/* Items */}
         <div className="cart-drawer-items">
           {items.length === 0 && (
             <p className="empty-cart">
               Your cart is empty
             </p>
           )}

           {items.map((item) => (
             <div
               key={item.id}
               className="cart-drawer-item"
             >
               {/* Image */}
               <div className="item-image">
                 {item.image ? (
                   <img
                     src={item.image}
                     alt={item.name}
                   />
                 ) : (
                   <div className="image-placeholder">
                     No Image
                   </div>
                 )}
               </div>

               {/* Info */}
               <div className="item-info">
                 <div className="item-title">
                   {item.name}
                 </div>

                 <div className="item-price">
                   ${item.price.toFixed(2)}
                 </div>

                 {/* Quantity */}
                 <div className="item-quantity">
                   <button
                     onClick={() =>
                       updateQuantity(
                         item.id,
                         item.quantity - 1
                       )
                     }
                     disabled={item.quantity <= 1}
                   >
                     −
                   </button>

                   <span>
                     {item.quantity}
                   </span>

                   <button
                     onClick={() =>
                       updateQuantity(
                         item.id,
                         item.quantity + 1
                       )
                     }
                   >
                     +
                   </button>
                 </div>

                 {/* Remove */}
                 <button
                   className="item-remove"
                   onClick={() =>
                     removeFromCart(item.id)
                   }
                 >
                   Remove
                 </button>
               </div>
             </div>
           ))}
         </div>

         {/* Summary */}
         <div className="cart-drawer-summary">
           {/* Discount */}
           <div className="discount-block">
             <label>
               Apply Discount Code
             </label>

             <div className="discount-row">
               <input
                 type="text"
                 placeholder="20 DOLLAR OFF"
                 onBlur={(e) =>
                   applyDiscountCode(
                     e.target.value
                   )
                 }
               />
               <button className="apply-btn">
                 Apply
               </button>
             </div>
           </div>

           {/* Totals */}
           <div className="summary-row">
             <span>Subtotal</span>
             <span>
               ${subtotal.toFixed(2)}
             </span>
           </div>

           <div className="summary-row">
             <span>Tax</span>
             <span>
               ${tax.toFixed(2)}
             </span>
           </div>

           <div className="summary-row">
             <span>Discount</span>
             <span>
               -${discount.toFixed(2)}
             </span>
           </div>

           <div className="summary-row total">
             <span>
               Estimated total
             </span>
             <span>
               ${total.toFixed(2)}
             </span>
           </div>

           {/* Checkout */}
           <button className="checkout-btn">
             Continue to checkout
           </button>
         </div>
       </div>
     </aside>
   </>
 );
}
