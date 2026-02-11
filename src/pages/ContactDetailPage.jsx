import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { contactsApi } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { ArrowLeft, User, FileText, Package, Hash } from 'lucide-react'
import { format } from 'date-fns'
import clsx from 'clsx'

const typeColors = {
  1: 'from-blue-500 to-cyan-500',
  2: 'from-green-500 to-emerald-500',
  3: 'from-yellow-500 to-orange-500',
  4: 'from-purple-500 to-pink-500',
  5: 'from-pink-500 to-rose-500',
}

export default function ContactDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const { data: contact, isLoading } = useQuery({
    queryKey: ['contact', id],
    queryFn: () => contactsApi.getById(id),
    enabled: !!id,
  })
  
  const { data: documents } = useQuery({
    queryKey: ['contact', id, 'documents'],
    queryFn: () => contactsApi.getDocuments(id, 10),
    enabled: !!id,
  })
  
  const { data: shipments } = useQuery({
    queryKey: ['contact', id, 'shipments'],
    queryFn: () => contactsApi.getShipments(id, 10),
    enabled: !!id,
  })
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  if (!contact) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-gray-400">Contact introuvable</p>
        <button
          onClick={() => navigate('/contacts')}
          className="btn-primary mt-4"
        >
          Retour aux contacts
        </button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/contacts')}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-4 flex-1">
          <div className={clsx(
            'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center',
            typeColors[contact.contact_type] || typeColors[1]
          )}>
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              {contact.display_name || 'Contact inconnu'}
            </h1>
            <p className="text-gray-400">{contact.contact_type_name}</p>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact info */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-display font-semibold text-white mb-4">
            Informations du contact
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Nom d'affichage</label>
              <p className="text-white">{contact.display_name || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">N° de compte</label>
              <p className="text-white font-mono">{contact.account_number || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Type de contact</label>
              <p className="text-white">{contact.contact_type_name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">ID Station</label>
              <p className="text-white">{contact.station_id}</p>
            </div>
          </div>
        </div>
        
        {/* Related documents */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-elite-400" />
              Documents
            </h3>
            <span className="text-sm text-gray-400">
              {documents?.document_count || 0} au total
            </span>
          </div>
          
          {documents?.documents?.length > 0 ? (
            <div className="space-y-2">
              {documents.documents.map((doc) => (
                <Link
                  key={doc.id}
                  to={`/documents/${doc.id}`}
                  className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <p className="text-white font-mono text-sm">
                    {doc.document_number || 'Sans numéro'}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {doc.origin} → {doc.destination}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucun document trouvé</p>
          )}
        </div>
        
        {/* Related shipments */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-cargo-success" />
              Expéditions
            </h3>
            <span className="text-sm text-gray-400">
              {shipments?.shipment_count || 0} au total
            </span>
          </div>
          
          {shipments?.shipments?.length > 0 ? (
            <div className="space-y-2">
              {shipments.shipments.map((ship) => (
                <div
                  key={ship.id}
                  className="p-3 rounded-lg bg-white/5"
                >
                  <p className="text-white font-mono text-sm">
                    {ship.master_number || ship.house_number || 'Sans numéro'}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {ship.origin} → {ship.destination}
                    {ship.shipment_date && (
                      <span className="ml-2">
                        {format(new Date(ship.shipment_date), 'dd/MM/yyyy')}
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucune expédition trouvée</p>
          )}
        </div>
      </div>
    </div>
  )
}

