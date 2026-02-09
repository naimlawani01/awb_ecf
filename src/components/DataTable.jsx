import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import clsx from 'clsx'
import LoadingSpinner from './LoadingSpinner'

export default function DataTable({
  columns,
  data,
  isLoading,
  pagination,
  onPageChange,
  onRowClick,
  emptyMessage = 'No data found',
  sortBy,
  sortDir,
  onSort,
}) {
  const handleSort = (columnKey) => {
    if (!onSort) return
    
    if (sortBy === columnKey) {
      // Toggle direction
      onSort(columnKey, sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      // New column, default to desc
      onSort(columnKey, 'desc')
    }
  }
  
  const getSortIcon = (columnKey) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-600" />
    }
    return sortDir === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-elite-400" />
      : <ArrowDown className="w-3.5 h-3.5 text-elite-400" />
  }
  
  if (isLoading) {
    return (
      <div className="glass-card p-8 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  if (!data?.length) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    )
  }
  
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx(
                    'px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider',
                    column.sortable && onSort && 'cursor-pointer hover:text-white transition-colors select-none',
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {column.label}
                    {column.sortable && onSort && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((row, index) => (
              <tr
                key={row.id || index}
                className={clsx(
                  'table-row',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={clsx('px-4 py-4 text-sm', column.cellClassName)}
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-4 py-4 border-t border-white/5">
          <p className="text-sm text-gray-400">
            Showing {((pagination.page - 1) * pagination.page_size) + 1} to{' '}
            {Math.min(pagination.page * pagination.page_size, pagination.total)} of{' '}
            {pagination.total.toLocaleString()} results
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(1)}
              disabled={pagination.page === 1}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="px-3 py-1 text-sm text-white">
              Page {pagination.page} of {pagination.total_pages}
            </span>
            
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.total_pages}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange?.(pagination.total_pages)}
              disabled={pagination.page >= pagination.total_pages}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

