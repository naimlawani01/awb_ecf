import { useState, useMemo, useEffect } from 'react'
import { useMonthlyVolume, useTopClients, useDestinationStats } from '../hooks/useStatistics'
import { MonthlyVolumeChart, DonutChart, ComparisonBarChart } from '../components/Charts'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Package, 
  Plane, 
  Users,
  ChevronDown,
  FileSpreadsheet,
  FileType,
  RefreshCw
} from 'lucide-react'
import { format, subMonths, subDays, subWeeks, startOfMonth, startOfWeek, startOfYear, startOfQuarter, subQuarters, subYears } from 'date-fns'
import { exportApi } from '../services/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// Période prédéfinies
const PERIOD_PRESETS = [
  { id: 'today', label: "Aujourd'hui", getRange: () => ({ start: format(new Date(), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { id: 'week', label: 'Cette semaine', getRange: () => ({ start: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { id: 'month', label: 'Ce mois', getRange: () => ({ start: format(startOfMonth(new Date()), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { id: 'quarter', label: 'Ce trimestre', getRange: () => ({ start: format(startOfQuarter(new Date()), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { id: 'year', label: 'Cette année', getRange: () => ({ start: format(startOfYear(new Date()), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { id: 'last30', label: '30 derniers jours', getRange: () => ({ start: format(subDays(new Date(), 30), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { id: 'last90', label: '90 derniers jours', getRange: () => ({ start: format(subDays(new Date(), 90), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { id: 'last12months', label: '12 derniers mois', getRange: () => ({ start: format(subMonths(new Date(), 12), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
]

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('last12months')
  const [dateRange, setDateRange] = useState({
    start: format(subMonths(new Date(), 12), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  })
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  
  // Appliquer une période prédéfinie
  const handlePeriodChange = (periodId) => {
    setSelectedPeriod(periodId)
    if (periodId !== 'custom') {
      const preset = PERIOD_PRESETS.find(p => p.id === periodId)
      if (preset) {
        setDateRange(preset.getRange())
      }
    }
  }
  
  // Gérer les changements de date personnalisés
  const handleDateChange = (field, value) => {
    setSelectedPeriod('custom')
    setDateRange(prev => ({ ...prev, [field]: value }))
  }
  
  const { data: monthlyVolume, isLoading: volumeLoading } = useMonthlyVolume(
    dateRange.start,
    dateRange.end
  )
  const { data: topClients, isLoading: clientsLoading } = useTopClients(10)
  const { data: destinations, isLoading: destLoading } = useDestinationStats(10)
  
  // Calculer les KPIs et tendances
  const kpis = useMemo(() => {
    if (!monthlyVolume?.data?.length) return null
    
    const totalDocs = monthlyVolume.total_documents || 0
    const totalShipments = monthlyVolume.total_shipments || 0
    const data = monthlyVolume.data
    
    // Calculer la moyenne mensuelle
    const avgMonthlyDocs = data.length > 0 ? Math.round(totalDocs / data.length) : 0
    const avgMonthlyShipments = data.length > 0 ? Math.round(totalShipments / data.length) : 0
    
    // Calculer la tendance (dernier mois vs avant-dernier)
    let docsTrend = 0
    let shipmentsTrend = 0
    if (data.length >= 2) {
      const lastMonth = data[data.length - 1]
      const prevMonth = data[data.length - 2]
      if (prevMonth.documents > 0) {
        docsTrend = Math.round(((lastMonth.documents - prevMonth.documents) / prevMonth.documents) * 100)
      }
      if (prevMonth.shipments > 0) {
        shipmentsTrend = Math.round(((lastMonth.shipments - prevMonth.shipments) / prevMonth.shipments) * 100)
      }
    }
    
    return {
      totalDocs,
      totalShipments,
      avgMonthlyDocs,
      avgMonthlyShipments,
      docsTrend,
      shipmentsTrend,
      totalRoutes: destinations?.total_routes || 0,
      totalClients: (topClients?.shippers?.length || 0) + (topClients?.consignees?.length || 0)
    }
  }, [monthlyVolume, destinations, topClients])
  
  const handleExport = async (type) => {
    setIsExporting(true)
    setExportMenuOpen(false)
    
    try {
      toast.loading(`Génération du rapport ${type.toUpperCase()}...`, { id: 'export' })
      
      const blob = type === 'excel' 
        ? await exportApi.downloadDocumentsExcel({ start_date: dateRange.start, end_date: dateRange.end })
        : await exportApi.downloadStatisticsPdf()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport_${selectedPeriod}_${format(new Date(), 'yyyyMMdd_HHmmss')}.${type === 'excel' ? 'xlsx' : 'pdf'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success('Rapport généré avec succès !', { id: 'export' })
    } catch (error) {
      toast.error('Erreur lors de la génération du rapport', { id: 'export' })
    } finally {
      setIsExporting(false)
    }
  }
  
  const getPeriodLabel = () => {
    const preset = PERIOD_PRESETS.find(p => p.id === selectedPeriod)
    return preset?.label || 'Période personnalisée'
  }
  
  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setExportMenuOpen(false)
    if (exportMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [exportMenuOpen])
  
  // Keyboard shortcut to close menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setExportMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-elite-600/20 to-elite-600/5">
            <BarChart3 className="w-6 h-6 text-elite-400" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              Rapports & Analytics
            </h1>
            <p className="text-gray-400 text-sm">
              {getPeriodLabel()} • Analyse complète de vos données
            </p>
          </div>
        </div>
        
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
            <span className="hidden sm:inline">Exporter le rapport</span>
            <span className="sm:hidden">Export</span>
            <ChevronDown className={clsx('w-4 h-4 transition-transform', exportMenuOpen && 'rotate-180')} />
          </button>
          
          {exportMenuOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-64 glass-card p-2 animate-scale-in z-50">
              <div className="px-3 py-2 border-b border-white/10 mb-2">
                <p className="text-xs text-gray-400">Période : {getPeriodLabel()}</p>
                <p className="text-xs text-gray-500">{dateRange.start} → {dateRange.end}</p>
              </div>
              <button
                onClick={() => handleExport('excel')}
                className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 rounded-lg flex items-center gap-3 group"
              >
                <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                  <FileSpreadsheet className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Export Excel</p>
                  <p className="text-xs text-gray-500">Données détaillées .xlsx</p>
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
                  <p className="font-medium text-white">Export PDF</p>
                  <p className="text-xs text-gray-500">Rapport synthétique .pdf</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Sélecteur de période */}
      <div className="glass-card p-4">
        <div className="flex flex-col gap-4">
          {/* Boutons de période prédéfinis */}
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
          
          {/* Sélecteur de dates personnalisé */}
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Période personnalisée :</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="input-field w-auto text-sm"
              />
              <span className="text-gray-500">→</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => handleDateChange('end', e.target.value)}
                className="input-field w-auto text-sm"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* KPIs Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Documents</p>
              <p className="text-2xl font-display font-bold text-white">
                {volumeLoading ? '-' : kpis?.totalDocs?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-elite-600/10">
              <FileText className="w-5 h-5 text-elite-400" />
            </div>
          </div>
          {kpis?.docsTrend !== undefined && kpis.docsTrend !== 0 && (
            <div className={clsx(
              'flex items-center gap-1 mt-2 text-sm',
              kpis.docsTrend > 0 ? 'text-cargo-success' : 'text-cargo-danger'
            )}>
              {kpis.docsTrend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{kpis.docsTrend > 0 ? '+' : ''}{kpis.docsTrend}% vs mois précédent</span>
            </div>
          )}
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Expéditions</p>
              <p className="text-2xl font-display font-bold text-white">
                {volumeLoading ? '-' : kpis?.totalShipments?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-cargo-success/10">
              <Package className="w-5 h-5 text-cargo-success" />
            </div>
          </div>
          {kpis?.shipmentsTrend !== undefined && kpis.shipmentsTrend !== 0 && (
            <div className={clsx(
              'flex items-center gap-1 mt-2 text-sm',
              kpis.shipmentsTrend > 0 ? 'text-cargo-success' : 'text-cargo-danger'
            )}>
              {kpis.shipmentsTrend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{kpis.shipmentsTrend > 0 ? '+' : ''}{kpis.shipmentsTrend}% vs mois précédent</span>
            </div>
          )}
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Routes actives</p>
              <p className="text-2xl font-display font-bold text-white">
                {destLoading ? '-' : kpis?.totalRoutes?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Plane className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Combinaisons origine-destination</p>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Moy. mensuelle</p>
              <p className="text-2xl font-display font-bold text-white">
                {volumeLoading ? '-' : kpis?.avgMonthlyDocs?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-purple-500/10">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Documents par mois</p>
        </div>
      </div>
      
      {/* Graphique Volume Mensuel */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-display font-semibold text-white mb-6">
          Volume mensuel
        </h3>
        {volumeLoading ? (
          <div className="h-80 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : monthlyVolume?.data?.length > 0 ? (
          <>
            <MonthlyVolumeChart data={monthlyVolume.data} height={320} />
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mt-4 pt-4 border-t border-white/5">
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-elite-400">
                  {monthlyVolume.total_documents.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Total Documents</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-cargo-success">
                  {monthlyVolume.total_shipments.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Total Expéditions</p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            Aucune donnée disponible pour cette période
          </div>
        )}
      </div>
      
      {/* Top Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-display font-semibold text-white mb-6">
            Top Expéditeurs
          </h3>
          {clientsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : topClients?.shippers?.length > 0 ? (
            <ComparisonBarChart
              data={topClients.shippers.map(s => ({
                name: s.name.substring(0, 20),
                count: s.document_count,
              }))}
              bars={[{ dataKey: 'count', name: 'Documents', color: '#00d4ff' }]}
              xAxisKey="name"
              height={280}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Aucun expéditeur disponible
            </div>
          )}
        </div>
        
        <div className="glass-card p-6">
          <h3 className="text-lg font-display font-semibold text-white mb-6">
            Top Destinataires
          </h3>
          {clientsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : topClients?.consignees?.length > 0 ? (
            <ComparisonBarChart
              data={topClients.consignees.map(c => ({
                name: c.name.substring(0, 20),
                count: c.document_count,
              }))}
              bars={[{ dataKey: 'count', name: 'Documents', color: '#10b981' }]}
              xAxisKey="name"
              height={280}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Aucun destinataire disponible
            </div>
          )}
        </div>
      </div>
      
      {/* Destinations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-display font-semibold text-white mb-6">
            Top Destinations
          </h3>
          {destLoading ? (
            <div className="h-64 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : destinations?.destinations?.length > 0 ? (
            <DonutChart
              data={destinations.destinations.map(d => ({
                name: d.airport_code,
                value: d.count,
              }))}
              height={280}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Aucune destination disponible
            </div>
          )}
        </div>
        
        <div className="glass-card p-6">
          <h3 className="text-lg font-display font-semibold text-white mb-6">
            Top Origines
          </h3>
          {destLoading ? (
            <div className="h-64 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : destinations?.origins?.length > 0 ? (
            <DonutChart
              data={destinations.origins.map(o => ({
                name: o.airport_code,
                value: o.count,
              }))}
              height={280}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Aucune origine disponible
            </div>
          )}
        </div>
      </div>
      
      {/* Stats routes */}
      {destinations?.total_routes > 0 && (
        <div className="glass-card p-6 text-center">
          <p className="text-4xl font-display font-bold text-gradient">
            {destinations.total_routes.toLocaleString()}
          </p>
          <p className="text-gray-400 mt-2">Routes uniques suivies</p>
        </div>
      )}
    </div>
  )
}

