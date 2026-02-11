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
  Calendar,
} from 'lucide-react'
import { format, formatDistanceToNow, subMonths, subDays, startOfMonth, startOfWeek, startOfYear, startOfQuarter } from 'date-fns'
import { fr } from 'date-fns/locale'
import { exportApi } from '../services/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const statusOptions = [
  { value: '0', label: 'Brouillon' },
  { value: '1', label: 'Actif' },
  { value: '2', label: 'Complété' },
  { value: '3', label: 'Annulé' },
  { value: '4', label: 'Archivé' },
]

// Périodes prédéfinies
const PERIOD_PRESETS = [
  { id: 'all', label: 'Tout', getRange: () => ({ start: null, end: null }) },
  { id: 'today', label: "Aujourd'hui", getRange: () => ({ start: format(new Date(), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { id: 'week', label: 'Cette semaine', getRange: () => ({ start: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { id: 'month', label: 'Ce mois', getRange: () => ({ start: format(startOfMonth(new Date()), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { id: 'quarter', label: 'Ce trimestre', getRange: () => ({ start: format(startOfQuarter(new Date()), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { id: 'year', label: 'Cette année', getRange: () => ({ start: format(startOfYear(new Date()), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { id: 'last30', label: '30 jours', getRange: () => ({ start: format(subDays(new Date(), 30), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { id: 'last90', label: '90 jours', getRange: () => ({ start: format(subDays(new Date(), 90), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
]

const getStatusBadge = (status) => {
  const statusMap = {
    0: { label: 'Brouillon', class: 'bg-gray-500/20 text-gray-400' },
    1: { label: 'Actif', class: 'bg-cargo-success/20 text-cargo-success' },
    2: { label: 'Complété', class: 'bg-elite-600/20 text-elite-400' },
    3: { label: 'Annulé', class: 'bg-cargo-danger/20 text-cargo-danger' },
    4: { label: 'Archivé', class: 'bg-gray-500/20 text-gray-400' },
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
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [sortBy, setSortBy] = useState('date_created')
  const [sortDir, setSortDir] = useState('desc')
  
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
  
  // Appliquer une période prédéfinie
  const handlePeriodChange = (periodId) => {
    setSelectedPeriod(periodId)
    const preset = PERIOD_PRESETS.find(p => p.id === periodId)
    if (preset) {
      const { start, end } = preset.getRange()
      updateFilters({ 
        ...filters, 
        start_date: start, 
        end_date: end 
      })
    }
  }
  
  // Obtenir le label de la période actuelle
  const getPeriodLabel = () => {
    const preset = PERIOD_PRESETS.find(p => p.id === selectedPeriod)
    return preset?.label || 'Période personnalisée'
  }
  
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
    order_by: sortBy,
    order_dir: sortDir,
    ...Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== null && v !== '')
    ),
  })
  
  // Handle sorting
  const handleSort = (column, direction) => {
    setSortBy(column)
    setSortDir(direction)
    setPage(1)
  }

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
      label: 'N° AWB',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-elite-400 font-medium">{value || '-'}</span>
      ),
    },
    {
      key: 'reference_number',
      label: 'Référence',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-amber-400 font-medium">{value || '-'}</span>
      ),
    },
    {
      key: 'shipper',
      label: 'Expéditeur',
      sortable: true,
      render: (value) => (
        <span className="text-white truncate max-w-[150px] block" title={value}>
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'consignee',
      label: 'Destinataire',
      sortable: true,
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
      label: 'Statut',
      sortable: true,
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'document_date',
      label: 'Date',
      sortable: true,
      render: (value) => (
        <div className="flex flex-col">
          <span className="text-gray-300 text-sm">
            {value ? format(new Date(value), 'dd/MM/yyyy') : '-'}
          </span>
          {value && (
            <span className="text-gray-500 text-xs">
              {formatDistanceToNow(new Date(value), { addSuffix: true, locale: fr })}
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
      
      toast.loading(`Génération du rapport ${type.toUpperCase()} détaillé...`, { id: 'export' })
      
      // Use the new detailed export endpoints with full AWB data
      const blob = type === 'excel' 
        ? await exportApi.downloadDetailedReportExcel(filterParams)
        : await exportApi.downloadDetailedReportPdf(filterParams)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const periodSuffix = selectedPeriod !== 'all' ? `_${selectedPeriod}` : ''
      a.download = `rapport_awb_detaille${periodSuffix}_${format(new Date(), 'yyyyMMdd_HHmmss')}.${type === 'excel' ? 'xlsx' : 'pdf'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success('Rapport détaillé exporté !', { id: 'export' })
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Échec de l\'export. Veuillez réessayer.', { id: 'export' })
    } finally {
      setIsExporting(false)
    }
  }, [filters, selectedPeriod])
  
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
              Documents AWB
              {filters.shipper && (
                <span className="text-base font-normal text-elite-400 bg-elite-600/15 px-3 py-1 rounded-full">
                  Expéditeur: {filters.shipper}
                </span>
              )}
            </h1>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <span className="font-semibold text-white">{data?.total?.toLocaleString() || 0}</span>
              {activeFilterCount > 0 ? 'documents trouvés' : 'documents au total'}
              {selectedPeriod !== 'all' && (
                <span className="text-elite-400">• {getPeriodLabel()}</span>
              )}
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
            <span className="hidden sm:inline">Actualiser</span>
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
              <span className="hidden sm:inline">Exporter</span>
              <ChevronDown className={clsx('w-4 h-4 transition-transform', exportMenuOpen && 'rotate-180')} />
            </button>
            
            {exportMenuOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-80 glass-card p-3 animate-scale-in z-50">
                {/* Info période */}
                <div className="px-3 py-2 border-b border-white/10 mb-3">
                  <p className="text-sm font-medium text-white">Rapport AWB Détaillé</p>
                  <p className="text-xs text-gray-400 mt-1">Période : {getPeriodLabel()}</p>
                  {filters.start_date && filters.end_date && (
                    <p className="text-xs text-gray-500">{filters.start_date} → {filters.end_date}</p>
                  )}
                  {activeFilterCount > 0 && (
                    <p className="text-xs text-elite-400 mt-1">{activeFilterCount} filtre(s) actif(s)</p>
                  )}
                </div>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full px-3 py-3 text-left text-sm text-gray-300 hover:bg-white/5 rounded-lg flex items-start gap-3 group mb-2"
                >
                  <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors flex-shrink-0">
                    <FileSpreadsheet className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">Export Excel Complet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Pièces, poids, tarifs, frais, routing
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-green-500/20 text-green-400">5 feuilles</span>
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-green-500/20 text-green-400">Statistiques</span>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-3 py-3 text-left text-sm text-gray-300 hover:bg-white/5 rounded-lg flex items-start gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors flex-shrink-0">
                    <FileType className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">Export PDF Synthèse</p>
                    <p className="text-xs text-gray-400 mt-1">
                      KPIs et résumé imprimable
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-red-500/20 text-red-400">Totaux</span>
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-red-500/20 text-red-400">Imprimable</span>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Sélecteur de période */}
      <div className="glass-card p-4">
        <div className="flex flex-col gap-4">
          {/* Boutons de période */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Période :</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PERIOD_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePeriodChange(preset.id)}
                  className={clsx(
                    'px-3 py-1.5 text-sm rounded-lg transition-all',
                    selectedPeriod === preset.id
                      ? 'bg-elite-600 text-white font-medium'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
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
              placeholder="Rechercher par numéro AWB..."
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
            Filtres
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
                <label className="block text-sm text-gray-400 mb-2 font-medium">Expéditeur</label>
                <SearchInput
                  value={filters.shipper}
                  onChange={(value) => updateFilters({ ...filters, shipper: value })}
                  placeholder="Nom de l'expéditeur..."
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">Destinataire</label>
                <SearchInput
                  value={filters.consignee}
                  onChange={(value) => updateFilters({ ...filters, consignee: value })}
                  placeholder="Nom du destinataire..."
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">Origine</label>
                <SearchInput
                  value={filters.origin}
                  onChange={(value) => updateFilters({ ...filters, origin: value })}
                  placeholder="Code aéroport (ex: JFK)..."
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">Destination</label>
                <SearchInput
                  value={filters.destination}
                  onChange={(value) => updateFilters({ ...filters, destination: value })}
                  placeholder="Code aéroport (ex: CDG)..."
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">Statut</label>
                <SelectFilter
                  value={filters.status}
                  onChange={(value) => updateFilters({ ...filters, status: value })}
                  options={statusOptions}
                  placeholder="Tous les statuts"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2 font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Période personnalisée
                </label>
                <DateRangeFilter
                  startDate={filters.start_date}
                  endDate={filters.end_date}
                  onStartChange={(value) => {
                    setSelectedPeriod('custom')
                    updateFilters({ ...filters, start_date: value })
                  }}
                  onEndChange={(value) => {
                    setSelectedPeriod('custom')
                    updateFilters({ ...filters, end_date: value })
                  }}
                />
              </div>
              
              {activeFilterCount > 0 && (
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      clearFilters()
                      setSelectedPeriod('all')
                    }}
                    className="flex items-center gap-2 text-sm text-cargo-danger hover:text-cargo-danger/80 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Effacer tous les filtres
                  </button>
                </div>
              )}
            </div>
            
            {/* Active filters tags */}
            {activeFilterCount > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                {Object.entries(filters)
                  .filter(([_, v]) => v !== null && v !== '')
                  .map(([key, value]) => {
                    const labelMap = {
                      awb_number: 'AWB',
                      shipper: 'Expéditeur',
                      consignee: 'Destinataire',
                      origin: 'Origine',
                      destination: 'Destination',
                      status: 'Statut',
                      start_date: 'Du',
                      end_date: 'Au',
                    }
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-elite-600/15 text-elite-400 text-xs rounded-full"
                      >
                        <span className="text-gray-400">{labelMap[key] || key}:</span>
                        <span className="font-medium">{value}</span>
                        <button
                          onClick={() => {
                            updateFilters({ ...filters, [key]: key === 'status' ? null : '' })
                            if (key === 'start_date' || key === 'end_date') {
                              setSelectedPeriod('all')
                            }
                          }}
                          className="ml-1 hover:text-white transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )
                  })}
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
        emptyMessage="Aucun document trouvé correspondant à vos critères"
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
      />
    </div>
  )
}
