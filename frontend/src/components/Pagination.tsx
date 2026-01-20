interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      {/* Previous */}
      <button
        className={`pagination-item ${
          currentPage === 1 ? "disabled" : ""
        }`}
        onClick={() => {
          if (currentPage > 1) {
            onPageChange(currentPage - 1);
          }
        }}
      >
        «
      </button>

      {/* Page numbers */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
        (page) => (
          <button
            key={page}
            className={`pagination-item ${
              page === currentPage ? "active" : ""
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        className={`pagination-item ${
          currentPage === totalPages ? "disabled" : ""
        }`}
        onClick={() => {
          if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
          }
        }}
      >
        »
      </button>
    </div>
  );
}
