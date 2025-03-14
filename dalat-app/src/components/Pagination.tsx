import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    maxButtons?: number;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, maxButtons = 5 }) => {
    const getPaginationButtons = () => {
        let start = Math.max(0, currentPage - Math.floor(maxButtons / 2));
        const end = Math.min(totalPages, start + maxButtons);

        if (end - start < maxButtons) {
            start = Math.max(0, end - maxButtons);
        }

        return Array.from({ length: end - start }, (_, index) => start + index);
    };

    return (
        <div className="max-w-6xl mx-auto mt-5 text-right">
            <button 
                onClick={() => onPageChange(0)} 
                disabled={currentPage === 0}
                className="px-2 py-2 border border-gray-300 rounded disabled:opacity-50 h-10 w-10 mx-1"
            >
                {"<<"}
            </button>
            <button 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 0}
                className="px-2 py-2 border border-gray-300 rounded disabled:opacity-50 h-10 w-10 mx-1"
            >
                {"<"}
            </button>
            {getPaginationButtons().map((pageIndex) => (
                <button
                    key={pageIndex}
                    onClick={() => onPageChange(pageIndex)}
                    disabled={currentPage === pageIndex}
                    className="px-2 py-2 border border-gray-300 rounded disabled:opacity-50 h-10 w-10 mx-1"
                >
                    {pageIndex + 1}
                </button>
            ))}
            <button 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages - 1}
                className="px-2 py-2 border border-gray-300 rounded disabled:opacity-50 h-10 w-10 mx-1"
            >
                {">"}
            </button>
            <button 
                onClick={() => onPageChange(totalPages - 1)} 
                disabled={currentPage === totalPages - 1}
                className="px-2 py-2 border border-gray-300 rounded disabled:opacity-50 h-10 w-10 mx-1"
            >
                {">>"}
            </button>
        </div>
    );
};

export default Pagination;