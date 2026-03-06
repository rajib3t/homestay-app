import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import PaginationItems from "./pagination-items";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  maxVisible?: number;
};

export const PaginationRender: React.FC<Props> = ({
  page,
  totalPages,
  onPageChange,
  maxVisible = 5,
}) => {
  if (totalPages <= 1) return null;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(page - 1)}
            className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>

        <PaginationItems page={page} totalPages={totalPages} onPageChange={onPageChange} maxVisible={maxVisible} />

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(page + 1)}
            className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationRender;
