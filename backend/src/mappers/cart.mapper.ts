export const mapCartItems = ({
  items,
}: {
  items: any[];
}) => {
  return {
    items: items
      .filter((item) => item.product) // Ensure product exists
      .map((item) => {
        const product = item.product;

        return {
          productId:
            product._id?.toString() ??
            product.toString(),
          name: product.title ?? "",
          price: product.price ?? 0,
          imageUrl: product.imageUrl ?? "",
          quantity: item.quantity,
          subtotal:
            (product.price ?? 0) *
            item.quantity,
        };
      }),
  };
};
