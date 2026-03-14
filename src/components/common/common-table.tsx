import React from 'react'
import PaginationRender from '@/components/pagination-render'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table'

import type { PaginatedMeta } from '@/types/common'

export type CommonTableProps<T> = {
  data?: T[]
  isLoading?: boolean
  meta?: PaginatedMeta
  onPageChange?: (newPage: number) => void
  renderHead: () => React.ReactNode
  renderRow: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string | number
  emptyPlaceholder?: string
  loadingPlaceholder?: string
}

function CommonTable<T>({
  data,
  isLoading,
  meta,
  onPageChange,
  renderHead,
  renderRow,
  keyExtractor,
  emptyPlaceholder = 'No items found.',
  loadingPlaceholder = 'Loading...',
}: CommonTableProps<T>) {
  const totalPages = meta?.total && meta?.size ? Math.ceil(meta.total / meta.size) : 1

  return (
    <div className="rounded-2xl border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>{renderHead()}</TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                <div className="animate-pulse text-muted-foreground">{loadingPlaceholder}</div>
              </TableCell>
            </TableRow>
          ) : !data || data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                {emptyPlaceholder}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={String(keyExtractor(item))}>{renderRow(item)}</TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="p-4">
          <PaginationRender
            page={meta?.page ?? 1}
            totalPages={totalPages}
            onPageChange={onPageChange ?? (() => {})}
          />
        </div>
      )}
    </div>
  )
}

export default CommonTable
