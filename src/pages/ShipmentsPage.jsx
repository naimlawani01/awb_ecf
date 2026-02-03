import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { shipmentsApi } from '../services/api'
import DataTable from '../components/DataTable'
import { SearchInput, SelectFilter } from '../components/Filters'
import { Package, RefreshCw, Filter } from 'lucide-react'
import { format } from 'date-fns'
import clsx from 'clsx'

const importExportOptions = [
  { value: '1', label: 'Import' },
  { value: '2', label: 'Export' },
  { value: '3', label: 'Transit' },
]

const getImportExportBadge = (type) => {
  const typeMap = {
    1: { label: 'Import', class: 'badge-info' },
    2: { label: 'Export', class: 'badge-success' },
    3: { label: 'Transit', class: 'badge-warning' },
  }
  const { label, class: className } = typeMap[type] || { label: '-', class: '' }
  return type ? <span className={clsx('badge', className)}>{label}</span> : '-'
}

export default function ShipmentsPage() {
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    master_number: '',
    shipper: '',
    consignee: '',
    origin: '',
    destination: '',
    import_export: null,
  })
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['shipments', page, filters],
    queryFn: () => shipmentsApi.list({
      page,
      page_size: 25,
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== null && v !== '')
      ),
    }),
    keepPreviousData: true,
  })
  
  const columns = [
    {
      key: 'master_number',
      label: 'Master Number',
      render: (value) => (
        <span className="font-mono text-elite-400">{value || '-'}</span>
      ),
    },
    {
      key: 'house_number',
      label: 'House Number',
      render: (value) => (
        <span className="font-mono text-white">{value || '-'}</span>
      ),
    },
    {
      key: 'shipper',
      label: 'Shipper',
      render: (value) => (
        <span className="text-white truncate max-w-[150px] block">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'consignee',
      label: 'Consignee',
      render: (value) => (
        <span className="text-white truncate max-w-[150px] block">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'origin',
      label: 'Origin',
      render: (value) => (
        <span className="text-gray-300">{value || '-'}</span>
      ),
    },
    {
      key: 'destination',
      label: 'Destination',
      render: (value) => (
        <span className="text-gray-300">{value || '-'}</span>
      ),
    },
    {
      key: 'import_export',
      label: 'Type',
      render: (value) => getImportExportBadge(value),
    },
    {
      key: 'event_status',
      label: 'Status',
      render: (value) => (
        <span className="text-gray-400">{value || '-'}</span>
      ),
    },
    {
      key: 'shipment_date',
      label: 'Date',
      render: (value) => (
        <span className="text-gray-400">
          {value ? format(new Date(value), 'MMM d, yyyy') : '-'}
        </span>
      ),
    },
  ]
  
  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== null && v !== ''
  ).length
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cargo-success/10">
            <Package className="w-6 h-6 text-cargo-success" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              Shipments
            </h1>
            <p className="text-gray-400 text-sm">
              {data?.total?.toLocaleString() || 0} total shipments
            </p>
          </div>
        </div>
        
        <button
          onClick={() => refetch()}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
      
      {/* Search and filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={filters.master_number}
              onChange={(value) => {
                setFilters({ ...filters, master_number: value })
                setPage(1)
              }}
              placeholder="Search by master number..."
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'btn-secondary flex items-center gap-2',
              showFilters && 'bg-white/10'
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-elite-400/20 text-elite-400 text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
        
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-white/5 animate-slide-down">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Shipper</label>
                <SearchInput
                  value={filters.shipper}
                  onChange={(value) => {
                    setFilters({ ...filters, shipper: value })
                    setPage(1)
                  }}
                  placeholder="Shipper name..."
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Consignee</label>
                <SearchInput
                  value={filters.consignee}
                  onChange={(value) => {
                    setFilters({ ...filters, consignee: value })
                    setPage(1)
                  }}
                  placeholder="Consignee name..."
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Origin</label>
                <SearchInput
                  value={filters.origin}
                  onChange={(value) => {
                    setFilters({ ...filters, origin: value })
                    setPage(1)
                  }}
                  placeholder="Airport code..."
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Type</label>
                <SelectFilter
                  value={filters.import_export}
                  onChange={(value) => {
                    setFilters({ ...filters, import_export: value })
                    setPage(1)
                  }}
                  options={importExportOptions}
                  placeholder="All types"
                />
              </div>
            </div>
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
        emptyMessage="No shipments found matching your criteria"
      />
    </div>
  )
}

