import { useState } from 'react'
import { useMonthlyVolume, useTopClients, useDestinationStats } from '../hooks/useStatistics'
import { MonthlyVolumeChart, DonutChart, ComparisonBarChart } from '../components/Charts'
import LoadingSpinner from '../components/LoadingSpinner'
import { BarChart3, Download, Calendar } from 'lucide-react'
import { format, subMonths } from 'date-fns'
import { exportApi } from '../services/api'
import toast from 'react-hot-toast'

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    start: format(subMonths(new Date(), 12), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  })
  
  const { data: monthlyVolume, isLoading: volumeLoading } = useMonthlyVolume(
    dateRange.start,
    dateRange.end
  )
  const { data: topClients, isLoading: clientsLoading } = useTopClients(10)
  const { data: destinations, isLoading: destLoading } = useDestinationStats(10)
  
  const handleExportStatsPdf = async () => {
    try {
      toast.loading('Generating statistics report...', { id: 'export' })
      const blob = await exportApi.downloadStatisticsPdf()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `awb_statistics_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success('Report generated!', { id: 'export' })
    } catch (error) {
      toast.error('Export failed', { id: 'export' })
    }
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary-600/10">
            <BarChart3 className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              Reports & Analytics
            </h1>
            <p className="text-gray-400 text-sm">
              Comprehensive data analysis and insights
            </p>
          </div>
        </div>
        
        <button
          onClick={handleExportStatsPdf}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>
      
      {/* Date range selector */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="w-5 h-5" />
            <span>Date Range:</span>
          </div>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="input-field w-auto"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="input-field w-auto"
          />
        </div>
      </div>
      
      {/* Monthly Volume Chart */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-display font-semibold text-white mb-6">
          Monthly Volume
        </h3>
        {volumeLoading ? (
          <div className="h-80 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : monthlyVolume?.data?.length > 0 ? (
          <>
            <MonthlyVolumeChart data={monthlyVolume.data} height={320} />
            <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-white/5">
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
                <p className="text-sm text-gray-400">Total Shipments</p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            No data available for selected period
          </div>
        )}
      </div>
      
      {/* Top Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-display font-semibold text-white mb-6">
            Top Shippers
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
              No shipper data available
            </div>
          )}
        </div>
        
        <div className="glass-card p-6">
          <h3 className="text-lg font-display font-semibold text-white mb-6">
            Top Consignees
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
              No consignee data available
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
              No destination data available
            </div>
          )}
        </div>
        
        <div className="glass-card p-6">
          <h3 className="text-lg font-display font-semibold text-white mb-6">
            Top Origins
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
              No origin data available
            </div>
          )}
        </div>
      </div>
      
      {/* Route stats */}
      {destinations?.total_routes > 0 && (
        <div className="glass-card p-6 text-center">
          <p className="text-4xl font-display font-bold text-gradient">
            {destinations.total_routes.toLocaleString()}
          </p>
          <p className="text-gray-400 mt-2">Unique Routes Tracked</p>
        </div>
      )}
    </div>
  )
}

