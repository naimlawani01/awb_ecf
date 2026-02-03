import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { contactsApi } from '../services/api'
import DataTable from '../components/DataTable'
import { SearchInput, SelectFilter } from '../components/Filters'
import { Users, RefreshCw, Filter } from 'lucide-react'
import clsx from 'clsx'

const contactTypeOptions = [
  { value: '1', label: 'Shipper' },
  { value: '2', label: 'Consignee' },
  { value: '3', label: 'Agent' },
  { value: '4', label: 'Notify Party' },
  { value: '5', label: 'Freight Forwarder' },
]

const getTypeBadge = (type, typeName) => {
  const colorMap = {
    1: 'badge-info',
    2: 'badge-success',
    3: 'badge-warning',
    4: 'bg-purple-500/20 text-purple-400',
    5: 'bg-pink-500/20 text-pink-400',
  }
  return (
    <span className={clsx('badge', colorMap[type] || 'badge-info')}>
      {typeName}
    </span>
  )
}

export default function ContactsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    display_name: '',
    account_number: '',
    contact_type: null,
  })
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['contacts', page, filters],
    queryFn: () => contactsApi.list({
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
      key: 'display_name',
      label: 'Name',
      render: (value) => (
        <span className="text-white font-medium">{value || '-'}</span>
      ),
    },
    {
      key: 'account_number',
      label: 'Account Number',
      render: (value) => (
        <span className="font-mono text-gray-300">{value || '-'}</span>
      ),
    },
    {
      key: 'contact_type',
      label: 'Type',
      render: (value, row) => getTypeBadge(value, row.contact_type_name),
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
          <div className="p-3 rounded-xl bg-cargo-warning/10">
            <Users className="w-6 h-6 text-cargo-warning" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              Contacts
            </h1>
            <p className="text-gray-400 text-sm">
              {data?.total?.toLocaleString() || 0} total contacts
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
              value={filters.display_name}
              onChange={(value) => {
                setFilters({ ...filters, display_name: value })
                setPage(1)
              }}
              placeholder="Search by name..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Account Number</label>
                <SearchInput
                  value={filters.account_number}
                  onChange={(value) => {
                    setFilters({ ...filters, account_number: value })
                    setPage(1)
                  }}
                  placeholder="Account number..."
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Contact Type</label>
                <SelectFilter
                  value={filters.contact_type}
                  onChange={(value) => {
                    setFilters({ ...filters, contact_type: value })
                    setPage(1)
                  }}
                  options={contactTypeOptions}
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
        onRowClick={(row) => navigate(`/contacts/${row.id}`)}
        emptyMessage="No contacts found matching your criteria"
      />
    </div>
  )
}

