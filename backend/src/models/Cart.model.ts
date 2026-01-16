// src/models/Cart.model.ts
import mongoose, {
  Schema,
  Document,
  Model,
  Types,
} from "mongoose";

/* ============================
   Cart Item Subdocument
============================ */

export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
}

/* ============================
   Cart Document
============================ */

export interface ICart extends Document {
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

/* ============================
   Schema
============================ */

const CartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    items: {
      type: [CartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ============================
   Model Export
============================ */

const Cart: Model<ICart> =
  mongoose.models.Cart ||
  mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
