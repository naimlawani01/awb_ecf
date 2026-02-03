import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDocuments } from '../hooks/useDocuments'
import DataTable from '../components/DataTable'
import { SearchInput, SelectFilter, DateRangeFilter } from '../components/Filters'
import { 
  FileText, 
  Download, 
  Filter, 
  RefreshCw, 
  FileSpreadsheet, 
  FileType,
  X,
  Plane,
  ChevronDown,
  Search,
  Clock,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { exportApi } from '../services/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const statusOptions = [
  { value: '0', label: 'Draft' },
  { value: '1', label: 'Active' },
  { value: '2', label: 'Completed' },
  { value: '3', label: 'Cancelled' },
  { value: '4', label: 'Archived' },
]

const getStatusBadge = (status) => {
  const statusMap = {
    0: { label: 'Draft', class: 'bg-gray-500/20 text-gray-400' },
    1: { label: 'Active', class: 'bg-cargo-success/20 text-cargo-success' },
    2: { label: 'Completed', class: 'bg-elite-600/20 text-elite-400' },
    3: { label: 'Cancelled', class: 'bg-cargo-danger/20 text-cargo-danger' },
    4: { label: 'Archived', class: 'bg-gray-500/20 text-gray-400' },
  }
  const { label, class: className } = statusMap[status] || statusMap[0]
  return <span className={clsx('badge', className)}>{label}</span>
}

export default function DocumentsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  
  // Initialize filters from URL search params
  const getInitialFilters = () => ({
    awb_number: searchParams.get('awb_number') || '',
    shipper: searchParams.get('shipper') || '',
    consignee: searchParams.get('consignee') || '',
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    status: searchParams.get('status') || null,
    start_date: searchParams.get('start_date') || null,
    end_date: searchParams.get('end_date') || null,
  })
  
  const [filters, setFilters] = useState(getInitialFilters)
  
  // Show filters panel if any filter is active from URL
  useEffect(() => {
    const hasUrlFilters = Array.from(searchParams.entries()).some(
      ([key, value]) => value && key !== 'awb_number'
    )
    if (hasUrlFilters) {
      setShowFilters(true)
    }
  }, [])
  
  const { data, isLoading, refetch, isFetching } = useDocuments({
    page,
    page_size: 25,
    ...Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== null && v !== '')
    ),
  })

  // Keyboard shortcut for search focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.querySelector('input[placeholder*="AWB"]')?.focus()
      }
      if (e.key === 'Escape') {
        setExportMenuOpen(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setExportMenuOpen(false)
    if (exportMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [exportMenuOpen])
  
  const columns = [
    {
      key: 'document_number',
      label: 'AWB Number',
      render: (value) => (
        <span className="font-mono text-elite-400 font-medium">{value || '-'}</span>
      ),
    },
    {
      key: 'shipper',
      label: 'Shipper',
      render: (value) => (
        <span className="text-white truncate max-w-[150px] block" title={value}>
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'consignee',
      label: 'Consignee',
      render: (value) => (
        <span className="text-white truncate max-w-[150px] block" title={value}>
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'route',
      label: 'Route',
      render: (_, row) => (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-300 font-mono">{row.origin || '---'}</span>
          <Plane className="w-3.5 h-3.5 text-elite-400 rotate-45" />
          <span className="text-gray-300 font-mono">{row.destination || '---'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'document_date',
      label: 'Date',
      render: (value) => (
        <div className="flex flex-col">
          <span className="text-gray-300 text-sm">
            {value ? format(new Date(value), 'MMM d, yyyy') : '-'}
          </span>
          {value && (
            <span className="text-gray-500 text-xs">
              {formatDistanceToNow(new Date(value), { addSuffix: true })}
            </span>
          )}
        </div>
      ),
    },
  ]
  
  const handleExport = useCallback(async (type) => {
    setIsExporting(true)
    setExportMenuOpen(false)
    
    try {
      const filterParams = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== null && v !== '')
      )
      
      toast.loading(`Generating ${type.toUpperCase()} export...`, { id: 'export' })
      
      const blob = type === 'excel' 
        ? await exportApi.downloadDocumentsExcel(filterParams)
        : await exportApi.downloadDocumentsPdf(filterParams)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `awb_documents_${format(new Date(), 'yyyyMMdd_HHmmss')}.${type === 'excel' ? 'xlsx' : 'pdf'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success('Export completed!', { id: 'export' })
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export failed. Please try again.', { id: 'export' })
    } finally {
      setIsExporting(false)
    }
  }, [filters])
  
  const clearFilters = () => {
    setFilters({
      awb_number: '',
      shipper: '',
      consignee: '',
      origin: '',
      destination: '',
      status: null,
      start_date: null,
      end_date: null,
    })
    setSearchParams({})
    setPage(1)
  }
  
  // Sync filters to URL
  const updateFilters = (newFilters) => {
    setFilters(newFilters)
    setPage(1)
    
    // Update URL params
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        params.set(key, value)
      }
    })
    setSearchParams(params)
  }
  
  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== null && v !== ''
  ).length
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-elite-600/20 to-elite-600/5">
            <FileText className="w-7 h-7 text-elite-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              AWB Documents
              {filters.shipper && (
                <span className="text-base font-normal text-elite-400 bg-elite-600/15 px-3 py-1 rounded-full">
                  Shipper: {filters.shipper}
                </span>
              )}
            </h1>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <span className="font-semibold text-white">{data?.total?.toLocaleString() || 0}</span>
              {activeFilterCount > 0 ? 'matching documents' : 'total documents'}
              {isFetching && !isLoading && (
                <RefreshCw className="w-3 h-3 animate-spin text-elite-400" />
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={clsx('w-4 h-4', isFetching && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          {/* Export dropdown */}
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation()
                setExportMenuOpen(!exportMenuOpen)
              }}
              disabled={isExporting}
              className="btn-primary flex items-center gap-2"
            >
              {isExporting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className={clsx('w-4 h-4 transition-transform', exportMenuOpen && 'rotate-180')} />
            </button>
            
            {exportMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 glass-card p-2 animate-scale-in z-50">
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 rounded-lg flex items-center gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                    <FileSpreadsheet className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Export to Excel</p>
                    <p className="text-xs text-gray-500">.xlsx format</p>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 rounded-lg flex items-center gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                    <FileType className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Export to PDF</p>
                    <p className="text-xs text-gray-500">.pdf format</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={filters.awb_number}
              onChange={(e) => updateFilters({ ...filters, awb_number: e.target.value })}
              className="input-field pl-11 pr-24"
              placeholder="Search by AWB number..."
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 bg-white/5 rounded border border-white/10">
                <span className="text-[10px]">⌘</span>K
              </kbd>
            </div>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'btn-secondary flex items-center gap-2 min-w-[120px] justify-center',
              showFilters && 'bg-elite-900/40 border-elite-600/30'
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-elite-600 text-white text-xs rounded-full font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
        
        {/* Expanded filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-white/5 animate-slide-down">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">Shipper</label>
                <SearchInput
                  value={filters.shipper}
                  onChange={(value) => updateFilters({ ...filters, shipper: value })}
                  placeholder="Shipper name..."
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">Consignee</label>
                <SearchInput
                  value={filters.consignee}
                  onChange={(value) => updateFilters({ ...filters, consignee: value })}
                  placeholder="Consignee name..."
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">Origin</label>
                <SearchInput
                  value={filters.origin}
                  onChange={(value) => updateFilters({ ...filters, origin: value })}
                  placeholder="Airport code (e.g., JFK)..."
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">Destination</label>
                <SearchInput
                  value={filters.destination}
                  onChange={(value) => updateFilters({ ...filters, destination: value })}
                  placeholder="Airport code (e.g., CDG)..."
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">Status</label>
                <SelectFilter
                  value={filters.status}
                  onChange={(value) => updateFilters({ ...filters, status: value })}
                  options={statusOptions}
                  placeholder="All statuses"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2 font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Date Range
                </label>
                <DateRangeFilter
                  startDate={filters.start_date}
                  endDate={filters.end_date}
                  onStartChange={(value) => updateFilters({ ...filters, start_date: value })}
                  onEndChange={(value) => updateFilters({ ...filters, end_date: value })}
                />
              </div>
              
              {activeFilterCount > 0 && (
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-cargo-danger hover:text-cargo-danger/80 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
            
            {/* Active filters tags */}
            {activeFilterCount > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                {Object.entries(filters)
                  .filter(([_, v]) => v !== null && v !== '')
                  .map(([key, value]) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-elite-600/15 text-elite-400 text-xs rounded-full"
                    >
                      <span className="text-gray-400 capitalize">{key.replace('_', ' ')}:</span>
                      <span className="font-medium">{value}</span>
                      <button
                        onClick={() => updateFilters({ ...filters, [key]: key === 'status' ? null : '' })}
                        className="ml-1 hover:text-white transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Data table */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        pagination={data ? {
          page: data.page,
          page_size: data.page_size,
          total: data.total,
          total_pages: data.total_pages,
        } : null}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/documents/${row.id}`)}
        emptyMessage="No documents found matching your criteria"
      />
    </div>
  )
}
