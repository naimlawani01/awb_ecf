import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDocument, useDocumentLogs, useDocumentDetails } from '../hooks/useDocuments'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  ArrowLeft, FileText, User, MapPin, Calendar, Clock, Tag, 
  Package, Scale, DollarSign, Plane, Receipt, CreditCard 
} from 'lucide-react'
import { format } from 'date-fns'
import clsx from 'clsx'

const statusMap = {
  0: { label: 'Brouillon', class: 'bg-gray-500/20 text-gray-400' },
  1: { label: 'Actif', class: 'badge-success' },
  2: { label: 'Complété', class: 'badge-info' },
  3: { label: 'Annulé', class: 'badge-danger' },
  4: { label: 'Archivé', class: 'bg-gray-500/20 text-gray-400' },
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
  const { data: detailsData, isLoading: detailsLoading } = useDocumentDetails(id)
  
  const awbDetails = detailsData?.awb_details
  
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
        <p className="text-gray-400">Document introuvable</p>
        <button
          onClick={() => navigate('/documents')}
          className="btn-primary mt-4"
        >
          Retour aux documents
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
              {document.document_number || 'Détails du document'}
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
              Informations du document
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">N° de document</label>
                <p className="text-white font-mono">{document.document_number || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">N° de document master</label>
                <p className="text-white font-mono">{document.master_document_number || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">N° de référence</label>
                <p className="text-white">{document.reference_number || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">ID Station</label>
                <p className="text-white">{document.station_id}</p>
              </div>
            </div>
          </div>
          
          {/* Parties */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-elite-400" />
              Parties prenantes
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg bg-white/5">
                <label className="text-sm text-elite-400 font-medium">Expéditeur</label>
                <p className="text-white mt-1">{document.shipper || 'Non spécifié'}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <label className="text-sm text-elite-400 font-medium">Destinataire</label>
                <p className="text-white mt-1">{document.consignee || 'Non spécifié'}</p>
              </div>
            </div>
          </div>
          
          {/* Route */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-elite-400" />
              Informations de route
            </h3>
            
            <div className="flex items-center justify-center gap-8">
              <div className="text-center min-w-[80px]">
                <div className="w-16 h-16 rounded-full bg-elite-400/20 flex items-center justify-center mb-2 mx-auto">
                  <span className="text-xl font-display font-bold text-elite-400">
                    {(document.origin || '---').substring(0, 3).toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-400">Origine</p>
                {document.origin && document.origin.length > 3 && (
                  <p className="text-xs text-gray-500 mt-1">{document.origin}</p>
                )}
              </div>
              
              <div className="flex-1 max-w-xs relative">
                <div className="h-0.5 bg-gradient-to-r from-elite-400 to-primary-600" />
                <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              
              <div className="text-center min-w-[80px]">
                <div className="w-16 h-16 rounded-full bg-primary-600/20 flex items-center justify-center mb-2 mx-auto">
                  <span className="text-xl font-display font-bold text-primary-400">
                    {(document.destination || '---').substring(0, 3).toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-400">Destination</p>
                {document.destination && document.destination.length > 3 && (
                  <p className="text-xs text-gray-500 mt-1">{document.destination}</p>
                )}
              </div>
            </div>
            
            {/* Flight routing details */}
            {awbDetails?.routing && (awbDetails.routing.flights?.length > 0 || awbDetails.routing.by?.length > 0) && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {awbDetails.routing.to?.length > 0 && (
                    <div>
                      <label className="text-gray-500">Via</label>
                      <p className="text-white font-mono">{awbDetails.routing.to.filter(Boolean).join(' → ')}</p>
                    </div>
                  )}
                  {awbDetails.routing.by?.length > 0 && (
                    <div>
                      <label className="text-gray-500">Compagnies</label>
                      <p className="text-white">{awbDetails.routing.by.filter(Boolean).join(', ')}</p>
                    </div>
                  )}
                  {awbDetails.routing.flights?.length > 0 && (
                    <div>
                      <label className="text-gray-500">Vols</label>
                      <p className="text-white font-mono">{awbDetails.routing.flights.filter(Boolean).join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Rate Description - Tarification */}
          {detailsLoading ? (
            <div className="glass-card p-6">
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
                <span className="ml-3 text-gray-400">Chargement des détails...</span>
              </div>
            </div>
          ) : awbDetails?.rate_description && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-elite-400" />
                Description des tarifs
              </h3>
              
              {/* Items table */}
              {awbDetails.rate_description.items?.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left">
                        <th className="py-3 px-2 text-gray-400 font-medium">Pièces</th>
                        <th className="py-3 px-2 text-gray-400 font-medium">Poids Brut</th>
                        <th className="py-3 px-2 text-gray-400 font-medium">Poids Taxable</th>
                        <th className="py-3 px-2 text-gray-400 font-medium">Tarif</th>
                        <th className="py-3 px-2 text-gray-400 font-medium">Total</th>
                        <th className="py-3 px-2 text-gray-400 font-medium">Nature des marchandises</th>
                      </tr>
                    </thead>
                    <tbody>
                      {awbDetails.rate_description.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-white/5">
                          <td className="py-3 px-2 text-white font-mono">{item.pieces}</td>
                          <td className="py-3 px-2 text-white font-mono">
                            {item.gross_weight} {item.scale}
                          </td>
                          <td className="py-3 px-2 text-white font-mono">
                            {item.chargeable_weight} {item.scale}
                          </td>
                          <td className="py-3 px-2 text-white font-mono">
                            {item.rate_charge > 0 ? item.rate_charge.toFixed(2) : '-'}
                          </td>
                          <td className="py-3 px-2 text-cargo-success font-mono font-medium">
                            {item.total > 0 ? item.total.toFixed(2) : '-'}
                          </td>
                          <td className="py-3 px-2 text-gray-300 max-w-[200px]">
                            <span className="line-clamp-2" title={item.nature}>
                              {item.nature || '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-white/10 bg-white/5">
                      <tr>
                        <td className="py-3 px-2 text-elite-400 font-bold">
                          {awbDetails.rate_description.total_pieces}
                        </td>
                        <td className="py-3 px-2 text-elite-400 font-bold font-mono">
                          {awbDetails.rate_description.total_weight} {awbDetails.rate_description.weight_scale}
                        </td>
                        <td colSpan="2" className="py-3 px-2"></td>
                        <td className="py-3 px-2 text-cargo-success font-bold font-mono">
                          {awbDetails.rate_description.items_total?.toFixed(2)} {awbDetails.currency}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
              
              {/* Other charges */}
              {awbDetails.other_charges?.length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Autres frais</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {awbDetails.other_charges.map((charge, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{charge.code}</span>
                          <span className="text-xs text-gray-500">{charge.due}</span>
                        </div>
                        <p className="text-white font-mono font-medium mt-1">
                          {charge.amount?.toFixed(2)} {awbDetails.currency}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Charges Summary */}
              {awbDetails.charges_summary && (
                <div className="mt-6 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Récapitulatif des charges</h4>
                  
                  {/* Table header */}
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 uppercase tracking-wider mb-2 pb-2 border-b border-white/10">
                    <span></span>
                    <span className="text-center">Prépayé</span>
                    <span className="text-center">Dû</span>
                  </div>
                  
                  {/* Weight Charge */}
                  {(awbDetails.charges_summary.weight_charge_prepaid > 0 || awbDetails.charges_summary.weight_charge_collect > 0) && (
                    <div className="grid grid-cols-3 gap-2 text-sm py-1">
                      <span className="text-gray-400">Frais de poids</span>
                      <span className="text-white font-mono text-center">{awbDetails.charges_summary.weight_charge_prepaid > 0 ? awbDetails.charges_summary.weight_charge_prepaid.toFixed(2) : '-'}</span>
                      <span className="text-white font-mono text-center">{awbDetails.charges_summary.weight_charge_collect > 0 ? awbDetails.charges_summary.weight_charge_collect.toFixed(2) : '-'}</span>
                    </div>
                  )}
                  
                  {/* Valuation Charge */}
                  {(awbDetails.charges_summary.valuation_charge_prepaid > 0 || awbDetails.charges_summary.valuation_charge_collect > 0) && (
                    <div className="grid grid-cols-3 gap-2 text-sm py-1">
                      <span className="text-gray-400">Frais de valeur</span>
                      <span className="text-white font-mono text-center">{awbDetails.charges_summary.valuation_charge_prepaid > 0 ? awbDetails.charges_summary.valuation_charge_prepaid.toFixed(2) : '-'}</span>
                      <span className="text-white font-mono text-center">{awbDetails.charges_summary.valuation_charge_collect > 0 ? awbDetails.charges_summary.valuation_charge_collect.toFixed(2) : '-'}</span>
                    </div>
                  )}
                  
                  {/* Tax */}
                  {(awbDetails.charges_summary.tax_prepaid > 0 || awbDetails.charges_summary.tax_collect > 0) && (
                    <div className="grid grid-cols-3 gap-2 text-sm py-1">
                      <span className="text-gray-400">Taxe</span>
                      <span className="text-white font-mono text-center">{awbDetails.charges_summary.tax_prepaid > 0 ? awbDetails.charges_summary.tax_prepaid.toFixed(2) : '-'}</span>
                      <span className="text-white font-mono text-center">{awbDetails.charges_summary.tax_collect > 0 ? awbDetails.charges_summary.tax_collect.toFixed(2) : '-'}</span>
                    </div>
                  )}
                  
                  {/* Other Charges Due Agent */}
                  {(awbDetails.charges_summary.other_due_agent_prepaid > 0 || awbDetails.charges_summary.other_due_agent_collect > 0) && (
                    <div className="grid grid-cols-3 gap-2 text-sm py-1">
                      <span className="text-gray-400">Autres frais agent</span>
                      <span className="text-white font-mono text-center">{awbDetails.charges_summary.other_due_agent_prepaid > 0 ? awbDetails.charges_summary.other_due_agent_prepaid.toFixed(2) : '-'}</span>
                      <span className="text-white font-mono text-center">{awbDetails.charges_summary.other_due_agent_collect > 0 ? awbDetails.charges_summary.other_due_agent_collect.toFixed(2) : '-'}</span>
                    </div>
                  )}
                  
                  {/* Other Charges Due Carrier */}
                  {(awbDetails.charges_summary.other_due_carrier_prepaid > 0 || awbDetails.charges_summary.other_due_carrier_collect > 0) && (
                    <div className="grid grid-cols-3 gap-2 text-sm py-1">
                      <span className="text-gray-400">Autres frais transporteur</span>
                      <span className="text-white font-mono text-center">{awbDetails.charges_summary.other_due_carrier_prepaid > 0 ? awbDetails.charges_summary.other_due_carrier_prepaid.toFixed(2) : '-'}</span>
                      <span className="text-white font-mono text-center">{awbDetails.charges_summary.other_due_carrier_collect > 0 ? awbDetails.charges_summary.other_due_carrier_collect.toFixed(2) : '-'}</span>
                    </div>
                  )}
                  
                  {/* Total */}
                  {(awbDetails.charges_summary.total_prepaid > 0 || awbDetails.charges_summary.total_collect > 0) && (
                    <div className="grid grid-cols-3 gap-2 text-sm py-2 mt-2 border-t border-white/10 font-bold">
                      <span className="text-elite-400">TOTAL</span>
                      <span className="text-cargo-success font-mono text-center">{awbDetails.charges_summary.total_prepaid > 0 ? `${awbDetails.charges_summary.total_prepaid.toFixed(2)}` : '-'}</span>
                      <span className="text-amber-400 font-mono text-center">{awbDetails.charges_summary.total_collect > 0 ? `${awbDetails.charges_summary.total_collect.toFixed(2)}` : '-'}</span>
                    </div>
                  )}
                  
                  {awbDetails.currency && (
                    <p className="text-xs text-gray-500 mt-2 text-right">Devise: {awbDetails.currency}</p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Additional AWB Info */}
          {awbDetails && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-elite-400" />
                Informations complémentaires
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {awbDetails.currency && (
                  <div>
                    <label className="text-sm text-gray-500">Devise</label>
                    <p className="text-white font-mono">{awbDetails.currency}</p>
                  </div>
                )}
                {awbDetails.weight_payment_type && (
                  <div>
                    <label className="text-sm text-gray-500">Paiement poids</label>
                    <p className="text-white">{awbDetails.weight_payment_type}</p>
                  </div>
                )}
                {awbDetails.other_charges_payment_type && (
                  <div>
                    <label className="text-sm text-gray-500">Paiement autres frais</label>
                    <p className="text-white">{awbDetails.other_charges_payment_type}</p>
                  </div>
                )}
                {awbDetails.value_carrier && (
                  <div>
                    <label className="text-sm text-gray-500">Valeur transporteur</label>
                    <p className="text-white">{awbDetails.value_carrier}</p>
                  </div>
                )}
                {awbDetails.value_customs && (
                  <div>
                    <label className="text-sm text-gray-500">Valeur douane</label>
                    <p className="text-white">{awbDetails.value_customs}</p>
                  </div>
                )}
                {awbDetails.insurance && (
                  <div>
                    <label className="text-sm text-gray-500">Assurance</label>
                    <p className="text-white">{awbDetails.insurance}</p>
                  </div>
                )}
              </div>
              
              {awbDetails.handling_information && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <label className="text-sm text-gray-500">Instructions de manutention</label>
                  <p className="text-white mt-1">{awbDetails.handling_information}</p>
                </div>
              )}
              
              {awbDetails.accounting_information && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <label className="text-sm text-gray-500">Informations comptables</label>
                  <p className="text-white mt-1 font-mono">{awbDetails.accounting_information}</p>
                </div>
              )}
              
              {awbDetails.sci && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <label className="text-sm text-gray-500">SCI (Shipment Control Info)</label>
                  <p className="text-white mt-1">{awbDetails.sci}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Notes / Information */}
          {awbDetails?.notes && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-elite-400" />
                Information
              </h3>
              <p className="text-white whitespace-pre-line">{awbDetails.notes}</p>
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Agent info */}
          {awbDetails?.agent && awbDetails.agent.details && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                <Plane className="w-5 h-5 text-elite-400" />
                Agent IATA
              </h3>
              
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-white text-sm whitespace-pre-line">{awbDetails.agent.details}</p>
                </div>
                {awbDetails.agent.iata_code && (
                  <div>
                    <label className="text-xs text-gray-500">Code IATA</label>
                    <p className="text-elite-400 font-mono font-medium">{awbDetails.agent.iata_code}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Certifications & Signatures */}
          {awbDetails?.signatures && (awbDetails.signatures.shipper || awbDetails.signatures.carrier) && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-elite-400" />
                Certifications
              </h3>
              
              <div className="space-y-4">
                {awbDetails.signatures.shipper && (
                  <div className="p-3 rounded-lg bg-white/5">
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Certification expéditeur</label>
                    <p className="text-white mt-2">{awbDetails.signatures.shipper}</p>
                  </div>
                )}
                {awbDetails.signatures.carrier && (
                  <div className="p-3 rounded-lg bg-white/5">
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Certification transporteur</label>
                    <p className="text-white mt-2">{awbDetails.signatures.carrier}</p>
                    {(awbDetails.signatures.place || awbDetails.signatures.date) && (
                      <p className="text-gray-400 text-sm mt-2">
                        {awbDetails.signatures.place}
                        {awbDetails.signatures.place && awbDetails.signatures.date && ', '}
                        {awbDetails.signatures.date}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Issued By */}
          {awbDetails?.issued_by && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-elite-400" />
                Émis par
              </h3>
              <p className="text-white whitespace-pre-line">{awbDetails.issued_by}</p>
            </div>
          )}
          
          {/* Dates */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-elite-400" />
              Dates
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Date du document</label>
                <p className="text-white">
                  {document.document_date
                    ? format(new Date(document.document_date), 'PPP')
                    : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Créé le</label>
                <p className="text-white">
                  {document.date_created
                    ? format(new Date(document.date_created), 'PPP p')
                    : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Dernière modification</label>
                <p className="text-white">
                  {document.date_modified
                    ? format(new Date(document.date_modified), 'PPP p')
                    : '-'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Tags - hide if empty or placeholder values like '--------' or 'y-------' */}
          {document.tags && !/^[-y]+$/.test(document.tags) && document.tags.replace(/-/g, '').length > 1 && (
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
              Journal d'activité
            </h3>
            
            {logs?.logs?.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {logs.logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg bg-white/5 text-sm"
                  >
                    <p className="text-gray-400">
                      Type: {log.log_type}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {format(new Date(log.log_date), 'PPP p')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Aucune activité</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

