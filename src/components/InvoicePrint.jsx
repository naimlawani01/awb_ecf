import { useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { numberToFrenchWords } from '../utils/numberToWords'

/**
 * Composant facture au format Delphinus - optimisé pour l'impression.
 * Une seule ligne dans le tableau (pas d'autres frais séparés).
 */
export default function InvoicePrint({ documentData, awbDetails, amountUSD, usdToGnf, onClose }) {
  const printRef = useRef(null)

  useEffect(() => {
    if (!printRef.current) return
    const content = printRef.current.innerHTML
    const printDoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture ${documentData?.document_number || ''}</title>
          <meta charset="utf-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.4; color: #000; padding: 24px; max-width: 210mm; }
            .header { margin-bottom: 24px; font-size: 14pt; font-family: 'Times New Roman', Times, serif; }
            .invoice-title { font-size: 14pt; font-weight: bold; margin-bottom: 8px; }
            .invoice-number { font-size: 14pt; font-weight: bold; margin-bottom: 16px; }
            .client-block { margin: 16px 0; padding: 0; font-size: 12pt; text-align: right; font-family: 'Times New Roman', Times, serif; }
            .client-label { font-weight: bold; margin-bottom: 4px; }
            .section { margin: 12px 0; font-size: 12pt; font-family: 'Times New Roman', Times, serif; }
            .section-label { font-weight: bold; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12pt; font-family: 'Times New Roman', Times, serif; }
            th, td { border: 1px solid #333; padding: 8px; text-align: left; }
            th { background: #f0f0f0; font-weight: bold; }
            .text-right { text-align: right; }
            .total-row { font-weight: bold; background: #f5f5f5; }
            .amount-payer { margin: 16px 0; font-size: 12pt; font-family: 'Times New Roman', Times, serif; }
            .amount-in-words { font-style: italic; margin: 16px 0; font-size: 12pt; font-family: 'Times New Roman', Times, serif; }
            .signature { margin-top: 48px; text-align: right; font-size: 12pt; font-family: 'Times New Roman', Times, serif; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `
    const iframe = window.document.createElement('iframe')
    iframe.style.position = 'absolute'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = 'none'
    window.document.body.appendChild(iframe)
    const doc = iframe.contentWindow.document
    doc.open()
    doc.write(printDoc)
    doc.close()
    iframe.contentWindow.focus()
    iframe.contentWindow.print()
    setTimeout(() => window.document.body.removeChild(iframe), 500)
    onClose?.()
  }, [documentData, awbDetails, amountUSD, usdToGnf, onClose])

  if (!documentData) return null

  const docDate = documentData.document_date ? format(new Date(documentData.document_date), 'dd MMMM yyyy', { locale: fr }) : '-'
  const originCode = (awbDetails?.routing?.departure_code || documentData.origin || '---').substring(0, 3).toUpperCase()
  const destCode = (awbDetails?.routing?.to?.length > 0
    ? (awbDetails.routing.to[awbDetails.routing.to.length - 1] || documentData.destination || '---')
    : (documentData.destination || '---')
  ).substring(0, 3).toUpperCase()
  const route = `${originCode}-${destCode}`.replace(/---/g, '-')

  const items = awbDetails?.rate_description?.items || []
  const totalPieces = awbDetails?.rate_description?.total_pieces ?? awbDetails?.total_pieces ?? 0
  const totalWeight = awbDetails?.rate_description?.total_weight ?? awbDetails?.total_weight ?? 0
  const weightScale = awbDetails?.rate_description?.weight_scale ?? awbDetails?.weight_scale ?? 'K'
  const currency = awbDetails?.currency || 'USD'
  const weightScaleLabel = weightScale === 'K' ? 'Kg' : weightScale

  const totalGNF = Math.round(amountUSD * usdToGnf)
  const amountInWords = numberToFrenchWords(totalGNF) + ' francs guinéens'

  const clientName = documentData.consignee || documentData.shipper || 'Client'
  const clientAddress = awbDetails?.consignee_details || ''

  const invoiceNumber = documentData.reference_number || `${documentData.document_number || documentData.id}/EC/${format(new Date(), 'dd/MM/yy')}`

  const natureDescription = items.length > 0
    ? items.map((it) => `${it.nature || 'Marchandises'}`).filter(Boolean)[0] || 'Transport aérien'
    : 'Transport aérien'
  const piecesPart = totalPieces ? `${totalPieces} colis` : ''
  const weightPart = totalWeight ? `${totalWeight} ${weightScaleLabel}` : ''
  const deNature = natureDescription ? ` de ${natureDescription}` : ''
  const libelle = `Transport de ${piecesPart} ${weightPart}${deNature} ${route} ${documentData.document_number || ''}`.trim().replace(/\s+/g, ' ')

  return (
    <div ref={printRef} className="invoice-print-content">
      <div className="header">
        <p>Conakry, le {docDate}</p>
        <p className="invoice-title">Facture N° {invoiceNumber}</p>
      </div>

      <div className="client-block">
        <p className="client-label">Client :</p>
        <p>{clientName}</p>
        {clientAddress && <p style={{ marginTop: 8 }}>{clientAddress}</p>}
      </div>

      <div className="section">
        <p className="section-label">Nature de l'opération :</p>
        <p>{libelle}</p>
      </div>

      <div className="section">
        <p>LTA : {documentData.document_number || '-'}</p>
      </div>

      <div className="section">
        <p className="section-label">Montant Total de l'opération :</p>
        <p>
          {amountUSD.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {currency}
          {' '}(1 USD = {usdToGnf.toLocaleString('fr-FR')} GNF)
        </p>
      </div>

      <table>
        <thead>
          <tr>
            <th>N°</th>
            <th>LIBELLE</th>
            <th>NOMBRE</th>
            <th>Montant en {currency}</th>
            <th>MONTANT en GNF</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>{libelle}</td>
            <td>{totalPieces} colis</td>
            <td className="text-right">{amountUSD.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
            <td className="text-right">{totalGNF.toLocaleString('fr-FR')}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="total-row">
            <td colSpan="4">MONTANT TOTAL</td>
            <td className="text-right">{totalGNF.toLocaleString('fr-FR')}</td>
          </tr>
        </tfoot>
      </table>

      <p className="amount-payer">
        Montant total à Payer : ………………………. {totalGNF.toLocaleString('fr-FR')} GNF
      </p>

      <p className="amount-in-words">
        Arrêtée la présente facture à la somme de : {amountInWords}.
      </p>

      <div className="signature">
        <p>Le Service Administratif & Financier</p>
      </div>
    </div>
  )
}
