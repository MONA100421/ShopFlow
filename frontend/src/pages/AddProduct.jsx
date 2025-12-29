import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";


// 这是一个“纯前端”的 action（下面我会告诉你去哪定义）
import { addLocalProduct } from "../redux/productSlice";

export default function AddProduct() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Category1");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [image, setImage] = useState("");

    function handleSubmit(e) {
        e.preventDefault();

        if (!name || !price) {
            alert("Product name and price are required");
            return;
        }

        const newProduct = {
            id: Date.now(), // 前端临时 id（后端版会换成 _id）
            name,
            description,
            category,
            price: Number(price),
            stock: Number(stock),
            image,
        };

        // ✅ 核心：把新 product 放进 Redux
        dispatch(addLocalProduct(newProduct));

        // 回到 products list
        navigate("/");
    }

    return (
        <div className="add-product-page">
            <h1>Create Product</h1>

            <form className="add-product-form" onSubmit={handleSubmit}>
                <label>
                    Product Name
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="iWatch"
                    />
                </label>

                <label>
                    Product Description
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Product description"
                    />
                </label>

                <div className="row">
                    <label>
                        Category
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="Category1">Category1</option>
                            <option value="Category2">Category2</option>
                            <option value="Category3">Category3</option>
                        </select>
                    </label>

                    <label>
                        Price
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="50"
                        />
                    </label>
                </div>

                <div className="row">
                    <label>
                        In Stock Quantity
                        <input
                            type="number"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            placeholder="100"
                        />
                    </label>

                    <label>
                        Image URL
                        <input
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            placeholder="http://..."
                        />
                    </label>
                </div>

                {image && (
                    <div className="image-preview">
                        <img src={image} alt="preview" />
                    </div>
                )}

                <button type="submit" className="primary-btn">
                    Add Product
                </button>
            </form>
        </div>
    );
}
