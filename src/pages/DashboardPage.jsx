import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useDashboardStats, useTopClients, useTrends, useRoutes, useAirlines } from '../hooks/useStatistics'
import { useRecentDocuments } from '../hooks/useDocuments'
import StatCard from '../components/StatCard'
import { TrendChart, DonutChart, ComparisonBarChart } from '../components/Charts'
import LoadingSpinner from '../components/LoadingSpinner'
import { Link } from 'react-router-dom'
import {
  FileText,
  Package,
  Users,
  Plane,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRight,
  Calendar,
  RefreshCw,
  Activity,
  Globe,
  Zap,
  Building2,
  MapPin,
  Navigation,
  Scale,
  DollarSign,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

// Animated number component
function AnimatedNumber({ value, duration = 1000 }) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    if (typeof value !== 'number') return
    
    const startTime = Date.now()
    const startValue = displayValue
    
    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(startValue + (value - startValue) * easeOut)
      
      setDisplayValue(current)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [value])
  
  return <span className="stat-number">{displayValue.toLocaleString()}</span>
}

// Activity indicator
function ActivityPulse() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cargo-success opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-cargo-success" />
    </span>
  )
}

// Skeleton loader for cards
function StatSkeleton() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="skeleton w-10 h-10 rounded-lg" />
        <div className="skeleton w-16 h-4 rounded" />
      </div>
      <div className="skeleton w-24 h-8 rounded mb-2" />
      <div className="skeleton w-32 h-4 rounded" />
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats()
  const { data: topClients } = useTopClients(5)
  const { data: trends } = useTrends(30)
  const { data: recentDocs } = useRecentDocuments(7, 10)
  const { data: routes } = useRoutes(10)
  const { data: airlines } = useAirlines(5)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetchStats()
    setLastUpdated(new Date())
    setTimeout(() => setIsRefreshing(false), 500)
  }
  
  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refetchStats()
      setLastUpdated(new Date())
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [refetchStats])
  
  if (statsLoading) {
    return (
      <div className="space-y-8">
        <div className="h-20 skeleton rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <StatSkeleton key={i} />)}
        </div>
      </div>
    )
  }
  
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }
  
  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="glass-card p-6 animate-fade-in-down">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                {getGreeting()}, <span className="text-gradient">{user?.first_name || user?.username}</span>
              </h1>
              <ActivityPulse />
            </div>
            <p className="text-gray-400">
              Voici l'état de vos opérations cargo aujourd'hui.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Mis à jour {formatDistanceToNow(lastUpdated, { addSuffix: true, locale: fr })}
              </p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="btn-secondary p-2.5 rounded-xl"
              title="Actualiser"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-stagger">
        <StatCard
          title="Total Documents"
          value={stats?.total_documents || 0}
          icon={FileText}
          trend={stats?.mom_growth >= 0 ? 'up' : 'down'}
          trendValue={stats?.mom_growth}
          subtitle="Tous les AWB"
          color="elite"
        />
        <StatCard
          title="Total Pièces"
          value={stats?.total_pieces || 0}
          icon={Package}
          subtitle="Colis expédiés"
          color="success"
        />
        <StatCard
          title="Poids Total"
          value={`${((stats?.total_weight || 0) / 1000).toFixed(1)}t`}
          icon={Scale}
          subtitle={`${(stats?.total_weight || 0).toLocaleString()} kg`}
          color="gold"
        />
        <StatCard
          title="Chiffre d'Affaires"
          value={`${((stats?.total_prepaid || 0) / 1000).toFixed(1)}k`}
          icon={DollarSign}
          subtitle={`${(stats?.total_prepaid || 0).toLocaleString()} ${stats?.main_currency || 'USD'}`}
          color="info"
        />
      </div>
      
      {/* Secondary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats?.total_shipments || 0}</p>
          <p className="text-xs text-gray-500">Expéditions</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats?.total_contacts || 0}</p>
          <p className="text-xs text-gray-500">Contacts</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats?.total_airlines || 0}</p>
          <p className="text-xs text-gray-500">Compagnies</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats?.total_airports || 0}</p>
          <p className="text-xs text-gray-500">Aéroports</p>
        </div>
      </div>
      
      {/* Quick stats with animated numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 hover-lift cursor-default group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-elite-600/20 to-elite-600/5 group-hover:from-elite-600/30 group-hover:to-elite-600/10 transition-all">
              <Zap className="w-5 h-5 text-elite-400" />
            </div>
            <span className="text-gray-400 font-medium">Aujourd'hui</span>
          </div>
          <p className="text-4xl font-bold text-white mb-1">
            <AnimatedNumber value={stats?.documents_today || 0} />
          </p>
          <p className="text-sm text-gray-500">Documents créés</p>
          <div className="mt-4 h-1 bg-elite-900/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-elite-600 to-elite-400 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((stats?.documents_today || 0) / 10 * 100, 100)}%` }}
            />
          </div>
        </div>
        
        <div className="glass-card p-6 hover-lift cursor-default group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cargo-success/20 to-cargo-success/5 group-hover:from-cargo-success/30 group-hover:to-cargo-success/10 transition-all">
              <Activity className="w-5 h-5 text-cargo-success" />
            </div>
            <span className="text-gray-400 font-medium">Cette semaine</span>
          </div>
          <p className="text-4xl font-bold text-white mb-1">
            <AnimatedNumber value={stats?.documents_this_week || 0} />
          </p>
          <p className="text-sm text-gray-500">Documents créés</p>
          <div className="mt-4 h-1 bg-elite-900/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cargo-success to-emerald-400 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((stats?.documents_this_week || 0) / 50 * 100, 100)}%` }}
            />
          </div>
        </div>
        
        <div className="glass-card p-6 hover-lift cursor-default group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cargo-gold/20 to-cargo-gold/5 group-hover:from-cargo-gold/30 group-hover:to-cargo-gold/10 transition-all">
              <Calendar className="w-5 h-5 text-cargo-gold" />
            </div>
            <span className="text-gray-400 font-medium">Ce mois</span>
          </div>
          <p className="text-4xl font-bold text-white mb-1">
            <AnimatedNumber value={stats?.documents_this_month || 0} />
          </p>
          <p className="text-sm text-gray-500">Documents créés</p>
          <div className="mt-4 h-1 bg-elite-900/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cargo-gold to-amber-400 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((stats?.documents_this_month || 0) / 200 * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily trends */}
        <div className="glass-card p-6 hover:border-elite-700/20 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-elite-400" />
              Évolution des documents
            </h3>
            <span className="text-xs text-gray-500 bg-elite-900/30 px-2 py-1 rounded-full">30 derniers jours</span>
          </div>
          {trends?.daily_trends?.length > 0 ? (
            <TrendChart
              data={trends.daily_trends}
              dataKey="count"
              xAxisKey="date"
              height={280}
            />
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-gray-500">
              <Activity className="w-12 h-12 mb-3 opacity-20" />
              <p>Aucune donnée disponible</p>
            </div>
          )}
        </div>
        
        {/* Status distribution */}
        <div className="glass-card p-6 hover:border-elite-700/20 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-cargo-success" />
              Répartition par statut
            </h3>
          </div>
          {trends?.status_distribution?.length > 0 ? (
            <DonutChart
              data={trends.status_distribution}
              dataKey="count"
              nameKey="name"
              height={280}
            />
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-gray-500">
              <Package className="w-12 h-12 mb-3 opacity-20" />
              <p>Aucune donnée disponible</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top clients */}
        <div className="glass-card p-6 hover:border-elite-700/20 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cargo-gold" />
              Top Expéditeurs
            </h3>
            <Link
              to="/documents"
              className="text-sm text-elite-400 hover:text-elite-300 flex items-center gap-1 group"
            >
              Voir tous
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          
          {topClients?.shippers?.length > 0 ? (
            <div className="space-y-3">
              {topClients.shippers.slice(0, 5).map((client, index) => (
                <Link
                  key={index}
                  to={`/documents?shipper=${encodeURIComponent(client.name)}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-elite-900/20 hover:bg-elite-900/40 transition-all group cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-gradient-to-br from-cargo-gold to-amber-600 text-white' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800' :
                      index === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-800 text-white' :
                      'bg-elite-800/50 text-gray-400'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-white font-medium truncate max-w-[160px] group-hover:text-elite-400 transition-colors">
                        {client.name}
                      </span>
                      <span className="text-xs text-gray-500">{client.percentage}% du total</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-lg">
                      {client.document_count}
                    </span>
                    <span className="text-gray-500 text-xs">docs</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Aucune donnée disponible</p>
            </div>
          )}
        </div>
        
        {/* Recent documents */}
        <div className="glass-card p-6 hover:border-elite-700/20 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-elite-400" />
              Documents récents
            </h3>
            <Link
              to="/documents"
              className="text-sm text-elite-400 hover:text-elite-300 flex items-center gap-1 group"
            >
              Voir tous
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          
          {recentDocs?.documents?.length > 0 ? (
            <div className="space-y-3">
              {recentDocs.documents.slice(0, 5).map((doc, index) => (
                <Link
                  key={doc.id}
                  to={`/documents/${doc.id}`}
                  className="block p-4 rounded-xl bg-elite-900/20 hover:bg-elite-900/40 transition-all group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-mono text-sm group-hover:text-elite-400 transition-colors">
                        {doc.document_number || 'Sans numéro'}
                      </p>
                      <p className="text-gray-500 text-xs mt-1 truncate max-w-[220px]">
                        {doc.shipper || 'Inconnu'} → {doc.consignee || 'Inconnu'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        <span className="text-gray-400">{doc.origin || '---'}</span>
                        <Plane className="w-3 h-3 text-elite-400 rotate-45" />
                        <span className="text-gray-400">{doc.destination || '---'}</span>
                      </div>
                      {doc.created_at && (
                        <p className="text-xs text-gray-600 mt-1">
                          {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true, locale: fr })}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Aucun document récent</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Routes & Airlines row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Routes */}
        <div className="glass-card p-6 hover:border-elite-700/20 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-elite-400" />
              Top Routes
            </h3>
            {routes?.main_hub && (
              <span className="text-xs text-gray-500 bg-elite-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Hub: {routes.main_hub}
              </span>
            )}
          </div>
          
          {routes?.routes?.length > 0 ? (
            <div className="space-y-3">
              {routes.routes.slice(0, 6).map((route, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-elite-900/20 hover:bg-elite-900/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 font-mono text-sm">
                      <span className="text-white font-bold">{route.origin}</span>
                      <Plane className="w-4 h-4 text-elite-400 rotate-90" />
                      <span className="text-white font-bold">{route.destination}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-elite-900/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-elite-500 to-elite-400 rounded-full"
                        style={{ width: `${route.percentage}%` }}
                      />
                    </div>
                    <span className="text-white font-bold text-sm w-8">{route.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <Navigation className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Aucune donnée disponible</p>
            </div>
          )}
        </div>
        
        {/* Airlines */}
        <div className="glass-card p-6 hover:border-elite-700/20 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Plane className="w-5 h-5 text-cargo-gold" />
              Compagnies aériennes
            </h3>
            {airlines?.total_awbs && (
              <span className="text-xs text-gray-500 bg-elite-900/30 px-2 py-1 rounded-full">
                {airlines.total_awbs} AWB au total
              </span>
            )}
          </div>
          
          {airlines?.airlines?.length > 0 ? (
            <div className="space-y-3">
              {airlines.airlines.map((airline, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-elite-900/20 hover:bg-elite-900/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
                      index === 0 ? 'bg-gradient-to-br from-cargo-gold to-amber-600 text-white' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800' :
                      index === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-800 text-white' :
                      'bg-elite-800/50 text-gray-400'
                    }`}>
                      {airline.prefix}
                    </span>
                    <div>
                      <p className="text-white font-medium">{airline.airline_name}</p>
                      <p className="text-xs text-gray-500">{airline.percentage}% des envois</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-white">{airline.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <Plane className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Aucune donnée disponible</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Top destinations */}
      {trends?.top_destinations?.length > 0 && (
        <div className="glass-card p-6 hover:border-elite-700/20 transition-colors animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-elite-400" />
              Top Destinations
            </h3>
            <span className="text-xs text-gray-500 bg-elite-900/30 px-2 py-1 rounded-full">
              Par nombre d'envois
            </span>
          </div>
          <ComparisonBarChart
            data={trends.top_destinations.map(d => ({
              name: d.code,
              count: d.count,
              percentage: d.percentage,
            }))}
            bars={[{ dataKey: 'count', name: 'Envois', color: '#037a6c' }]}
            xAxisKey="name"
            height={280}
          />
        </div>
      )}
    </div>
  )
}
