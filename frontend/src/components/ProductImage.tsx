import "./ProductImage.css";

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export default function ProductImage({
  src,
  alt,
  className = "",
}: ProductImageProps) {
  if (!src) {
    return (
      <div className={`product-image-root ${className}`}>
        <div className="product-image-placeholder">
          No Image
        </div>
      </div>
    );
  }

  return (
    <div className={`product-image-root ${className}`}>
      <img src={src} alt={alt} />
    </div>
  );
}
