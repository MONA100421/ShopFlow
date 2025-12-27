import { useState } from "react";
import type{ Product } from "../types/Product";

export default function ProductForm({
  initialData,
  onSubmit,
}: {
  initialData?: Product;
  onSubmit: (p: Product) => void;
}) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [price, setPrice] = useState(initialData?.price ?? 0);
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      id: initialData?.id ?? crypto.randomUUID(),
      title,
      price,
      description,
      image: "",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button type="submit">Save</button>
    </form>
  );
}
