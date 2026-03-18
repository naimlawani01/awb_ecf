import { useState, useEffect } from 'react'
import { X, Printer, FileDown } from 'lucide-react'
import { documentsApi } from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const DEFAULT_USD_TO_GNF = 8960

/**
 * Modal pour éditer le taux de conversion et le montant avant d'imprimer la facture.
 */
export default function InvoiceEditModal({ documentId, documentData, awbDetails, onClose }) {
  const defaultAmount = awbDetails?.rate_description?.items_total ??
    awbDetails?.charges_summary?.total_prepaid ??
    awbDetails?.items_total ?? 0
  const otherTotal = (awbDetails?.other_charges || []).reduce((s, c) => s + (c.amount || 0), 0)
  const computedTotal = defaultAmount + otherTotal

  const [usdToGnf, setUsdToGnf] = useState(DEFAULT_USD_TO_GNF)
  const [amountUSD, setAmountUSD] = useState(computedTotal > 0 ? computedTotal : 0)

  useEffect(() => {
    if (computedTotal > 0) setAmountUSD(computedTotal)
  }, [computedTotal])

  const [isDownloading, setIsDownloading] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const handleDownloadWord = async () => {
    if (!documentId) return
    setIsDownloading(true)
    try {
      const blob = await documentsApi.downloadInvoiceWord(documentId, amountUSD, usdToGnf)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `facture_${documentData?.document_number || documentId}_${format(new Date(), 'yyyyMMdd_HHmm')}.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('Facture Word téléchargée')
    } catch (err) {
      console.error(err)
      toast.error('Échec du téléchargement')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleGeneratePdf = async () => {
    if (!documentId) return
    setIsGeneratingPdf(true)
    try {
      const blob = await documentsApi.downloadInvoicePdf(documentId, amountUSD, usdToGnf)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `facture_${documentData?.document_number || documentId}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.open(url, '_blank')
      setTimeout(() => window.URL.revokeObjectURL(url), 5000)
      toast.success('Facture PDF générée')
    } catch (err) {
      console.error(err)
      toast.error('Échec de la génération PDF')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const totalGNF = Math.round(amountUSD * usdToGnf)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-white">Paramètres de la facture</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Taux de conversion (1 USD = ? GNF)
            </label>
            <input
              type="number"
              value={usdToGnf}
              onChange={(e) => setUsdToGnf(e.target.value)}
              min="1"
              step="1"
              className="input-field w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Montant à facturer (USD)
            </label>
            <input
              type="number"
              value={amountUSD}
              onChange={(e) => setAmountUSD(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              className="input-field w-full"
              required
            />
            {computedTotal > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Montant calculé depuis l'AWB : {computedTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} USD
              </p>
            )}
          </div>

          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-sm text-gray-400">Montant total en GNF</p>
            <p className="text-lg font-bold text-elite-400">{totalGNF.toLocaleString('fr-FR')} GNF</p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDownloadWord}
                disabled={isDownloading}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                {isDownloading ? 'Téléchargement...' : 'Télécharger Word'}
              </button>
            </div>
            <button
              type="button"
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              {isGeneratingPdf ? 'Génération...' : 'Générer et imprimer (PDF)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
