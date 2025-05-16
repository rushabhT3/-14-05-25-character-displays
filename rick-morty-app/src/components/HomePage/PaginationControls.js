// src/components/HomePage/PaginationControls.js
import React from "react";
import styles from "../../pages/HomePage.module.css";

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}) {
  return (
    <div className={styles.pagination}>
      <button
        onClick={() => onPageChange((p) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <span>
        Page {currentPage} of {Math.max(1, totalPages)}
      </span>
      <button
        onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        Next
      </button>
    </div>
  );
}
