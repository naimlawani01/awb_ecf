import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDocument, useDocumentLogs } from '../hooks/useDocuments'
import LoadingSpinner from '../components/LoadingSpinner'
import { ArrowLeft, FileText, User, MapPin, Calendar, Clock, Tag } from 'lucide-react'
import { format } from 'date-fns'
import clsx from 'clsx'

const statusMap = {
  0: { label: 'Draft', class: 'bg-gray-500/20 text-gray-400' },
  1: { label: 'Active', class: 'badge-success' },
  2: { label: 'Completed', class: 'badge-info' },
  3: { label: 'Cancelled', class: 'badge-danger' },
  4: { label: 'Archived', class: 'bg-gray-500/20 text-gray-400' },
}

const typeMap = {
  1: 'Air Waybill (AWB)',
  2: 'House Waybill (HAWB)',
  3: 'Master Waybill (MAWB)',
  4: 'Commercial Invoice',
  5: 'Packing List',
}

export default function DocumentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: document, isLoading, error } = useDocument(id)
  const { data: logs } = useDocumentLogs(id)
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  if (error || !document) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-gray-400">Document not found</p>
        <button
          onClick={() => navigate('/documents')}
          className="btn-primary mt-4"
        >
          Back to Documents
        </button>
      </div>
    )
  }
  
  const status = statusMap[document.status] || statusMap[0]
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/documents')}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-white">
              {document.document_number || 'Document Details'}
            </h1>
            <span className={clsx('badge', status.class)}>{status.label}</span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            {typeMap[document.document_type] || `Document Type ${document.document_type}`}
          </p>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document numbers */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-elite-400" />
              Document Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Document Number</label>
                <p className="text-white font-mono">{document.document_number || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Master Document Number</label>
                <p className="text-white font-mono">{document.master_document_number || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Reference Number</label>
                <p className="text-white">{document.reference_number || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Station ID</label>
                <p className="text-white">{document.station_id}</p>
              </div>
            </div>
          </div>
          
          {/* Parties */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-elite-400" />
              Parties
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg bg-white/5">
                <label className="text-sm text-elite-400 font-medium">Shipper</label>
                <p className="text-white mt-1">{document.shipper || 'Not specified'}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <label className="text-sm text-elite-400 font-medium">Consignee</label>
                <p className="text-white mt-1">{document.consignee || 'Not specified'}</p>
              </div>
            </div>
          </div>
          
          {/* Route */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-elite-400" />
              Route Information
            </h3>
            
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-elite-400/20 flex items-center justify-center mb-2">
                  <span className="text-2xl font-display font-bold text-elite-400">
                    {document.origin || '---'}
                  </span>
                </div>
                <p className="text-sm text-gray-400">Origin</p>
              </div>
              
              <div className="flex-1 max-w-xs relative">
                <div className="h-0.5 bg-gradient-to-r from-elite-400 to-primary-600" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-cargo-dark rounded-full text-xs text-gray-400">
                  {document.route || 'Direct'}
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary-600/20 flex items-center justify-center mb-2">
                  <span className="text-2xl font-display font-bold text-primary-400">
                    {document.destination || '---'}
                  </span>
                </div>
                <p className="text-sm text-gray-400">Destination</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Dates */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-elite-400" />
              Dates
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Document Date</label>
                <p className="text-white">
                  {document.document_date
                    ? format(new Date(document.document_date), 'PPP')
                    : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Created</label>
                <p className="text-white">
                  {document.date_created
                    ? format(new Date(document.date_created), 'PPP p')
                    : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Last Modified</label>
                <p className="text-white">
                  {document.date_modified
                    ? format(new Date(document.date_modified), 'PPP p')
                    : '-'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Tags */}
          {document.tags && document.tags !== '--------' && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-elite-400" />
                Tags
              </h3>
              <p className="text-white font-mono">{document.tags}</p>
            </div>
          )}
          
          {/* Activity log */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-elite-400" />
              Activity Log
            </h3>
            
            {logs?.logs?.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {logs.logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg bg-white/5 text-sm"
                  >
                    <p className="text-gray-400">
                      Log Type: {log.log_type}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {format(new Date(log.log_date), 'PPP p')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No activity logs</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

