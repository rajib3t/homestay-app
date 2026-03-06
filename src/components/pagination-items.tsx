import React from "react";
import {
  PaginationItem,
  PaginationEllipsis,
  PaginationLink,
} from "@/components/ui/pagination";

type PaginationItemsProps = {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  maxVisible?: number;
};

export const PaginationItems: React.FC<PaginationItemsProps> = ({
  page,
  totalPages,
  onPageChange,
  maxVisible = 5,
}) => {
  const items: React.ReactNode[] = [];

  let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  if (startPage > 1) {
    items.push(
      <PaginationItem key="1">
        <PaginationLink onClick={() => onPageChange(1)} className="cursor-pointer">
          1
        </PaginationLink>
      </PaginationItem>
    );
    if (startPage > 2) {
      items.push(
        <PaginationItem key="start-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    items.push(
      <PaginationItem key={i}>
        <PaginationLink
          isActive={page === i}
          onClick={() => onPageChange(i)}
          className="cursor-pointer"
        >
          {i}
        </PaginationLink>
      </PaginationItem>
    );
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="end-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    items.push(
      <PaginationItem key={totalPages}>
        <PaginationLink onClick={() => onPageChange(totalPages)} className="cursor-pointer">
          {totalPages}
        </PaginationLink>
      </PaginationItem>
    );
  }

  return <>{items}</>;
};

export default PaginationItems;
