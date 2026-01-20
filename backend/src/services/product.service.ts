import Product, { IProduct } from "../models/Product.model";
import Cart from "../models/Cart.model";

type CreateProductInput = Partial<IProduct>;
type UpdateProductInput = Partial<IProduct>;

export const getAllProducts = async (): Promise<IProduct[]> => {
  return Product.find({ isActive: true }).sort({ createdAt: -1 });
};

export const getProductById = async (
  productId: string
): Promise<IProduct | null> => {
  return Product.findOne({ _id: productId, isActive: true });
};

export const createProduct = async (
  data: CreateProductInput
): Promise<IProduct> => {
  const product = new Product(data);
  return product.save();
};

export const updateProduct = async (
  productId: string,
  data: UpdateProductInput
): Promise<IProduct | null> => {
  return Product.findByIdAndUpdate(
    productId,
    { $set: data },
    { new: true, runValidators: true }
  );
};

export const deleteProduct = async (
  productId: string
): Promise<IProduct | null> => {
  const product = await Product.findByIdAndUpdate(
    productId,
    { isActive: false },
    { new: true }
  );

  if (!product) return null;

  await Cart.updateMany(
    {},
    {
      $pull: {
        items: { product: product._id },
      },
    }
  );

  return product;
};
