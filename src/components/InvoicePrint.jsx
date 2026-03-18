import { useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { numberToFrenchWords } from '../utils/numberToWords'

// Taux de change USD → GNF (configurable)
const USD_TO_GNF = 8960

/**
 * Composant facture au format Delphinus - optimisé pour l'impression.
 * Affiche une facture basée sur les données AWB du document.
 */
export default function InvoicePrint({ document, awbDetails, onClose }) {
  const printRef = useRef(null)

  useEffect(() => {
    if (!printRef.current) return
    const content = printRef.current.innerHTML
    const printDoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture ${document?.document_number || ''}</title>
          <meta charset="utf-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.4; color: #000; padding: 24px; max-width: 210mm; }
            .header { margin-bottom: 24px; }
            .invoice-title { font-size: 18pt; font-weight: bold; margin-bottom: 8px; }
            .invoice-number { font-size: 14pt; font-weight: bold; margin-bottom: 16px; }
            .client-block { margin: 16px 0; padding: 12px; border: 1px solid #333; }
            .client-label { font-weight: bold; margin-bottom: 4px; }
            .section { margin: 12px 0; }
            .section-label { font-weight: bold; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th, td { border: 1px solid #333; padding: 8px; text-align: left; }
            th { background: #f0f0f0; font-weight: bold; }
            .text-right { text-align: right; }
            .total-row { font-weight: bold; background: #f5f5f5; }
            .amount-block { margin: 16px 0; padding: 12px; border: 1px solid #333; }
            .amount-in-words { font-style: italic; margin: 16px 0; }
            .signature { margin-top: 48px; text-align: right; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `
    const iframe = document.createElement('iframe')
    iframe.style.position = 'absolute'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = 'none'
    document.body.appendChild(iframe)
    const doc = iframe.contentWindow.document
    doc.open()
    doc.write(printDoc)
    doc.close()
    iframe.contentWindow.focus()
    iframe.contentWindow.print()
    setTimeout(() => document.body.removeChild(iframe), 500)
    onClose?.()
  }, [document, awbDetails, onClose])

  if (!document) return null

  const docDate = document.document_date ? format(new Date(document.document_date), 'dd MMMM yyyy', { locale: fr }) : '-'
  const originCode = (awbDetails?.routing?.departure_code || document.origin || '---').substring(0, 3).toUpperCase()
  const destCode = (awbDetails?.routing?.to?.length > 0
    ? (awbDetails.routing.to[awbDetails.routing.to.length - 1] || document.destination || '---')
    : (document.destination || '---')
  ).substring(0, 3).toUpperCase()
  const route = `${originCode}-${destCode}`.replace(/---/g, '-')

  const items = awbDetails?.rate_description?.items || []
  const totalPieces = awbDetails?.rate_description?.total_pieces ?? awbDetails?.total_pieces ?? 0
  const totalWeight = awbDetails?.rate_description?.total_weight ?? awbDetails?.total_weight ?? 0
  const weightScale = awbDetails?.rate_description?.weight_scale ?? awbDetails?.weight_scale ?? 'K'
  const currency = awbDetails?.currency || 'USD'
  const totalUSD = awbDetails?.rate_description?.items_total ?? awbDetails?.charges_summary?.total_prepaid ?? awbDetails?.items_total ?? 0
  const otherCharges = awbDetails?.other_charges || []
  const otherTotal = otherCharges.reduce((sum, c) => sum + (c.amount || 0), 0)
  const grandTotalUSD = totalUSD + otherTotal
  const totalGNF = Math.round(grandTotalUSD * USD_TO_GNF)
  const amountInWords = numberToFrenchWords(totalGNF) + ' francs guinéens'

  const clientName = document.consignee || document.shipper || 'Client'
  const clientAddress = awbDetails?.consignee_details || ''
  const weightScaleLabel = weightScale === 'K' ? 'Kg' : weightScale

  const invoiceNumber = document.reference_number || `${document.document_number || document.id}/EC/${format(new Date(), 'dd/MM/yy')}`

  const natureDescription = items.length > 0
    ? items.map((it) => `${it.nature || 'Marchandises'}`).filter(Boolean)[0] || 'Transport aérien'
    : 'Transport aérien'
  const piecesPart = totalPieces ? `${totalPieces} colis` : ''
  const weightPart = totalWeight ? `${totalWeight} ${weightScaleLabel}` : ''
  const operationNature = ['Transport', piecesPart, weightPart, natureDescription, route].filter(Boolean).join(' ')

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
        <p>{operationNature}</p>
      </div>

      <div className="section">
        <p>LTA : {document.document_number || '-'}</p>
      </div>

      <div className="section">
        <p className="section-label">Montant Total de l'opération :</p>
        <p>
          {grandTotalUSD.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {currency}
          {' '}(1 USD = {USD_TO_GNF.toLocaleString('fr-FR')} GNF)
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
          {items.length > 0 ? (
            items.map((item, idx) => {
              const itemGNF = Math.round((item.total || 0) * USD_TO_GNF)
              const desc = `${item.nature || 'Transport'} ${route} ${document.document_number || ''}`.trim()
              return (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{desc}</td>
                  <td>{item.pieces} colis</td>
                  <td className="text-right">{(item.total || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                  <td className="text-right">{itemGNF.toLocaleString('fr-FR')}</td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td>1</td>
              <td>Transport {route} {document.document_number || ''}</td>
              <td>{totalPieces} colis</td>
              <td className="text-right">{grandTotalUSD.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
              <td className="text-right">{totalGNF.toLocaleString('fr-FR')}</td>
            </tr>
          )}
          {otherCharges.map((charge, idx) => (
            <tr key={`oc-${idx}`}>
              <td>{items.length + idx + 1}</td>
              <td>{charge.code || 'Autres frais'}</td>
              <td>-</td>
              <td className="text-right">{(charge.amount || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
              <td className="text-right">{Math.round((charge.amount || 0) * USD_TO_GNF).toLocaleString('fr-FR')}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="total-row">
            <td colSpan="4">MONTANT TOTAL</td>
            <td className="text-right">{totalGNF.toLocaleString('fr-FR')}</td>
          </tr>
        </tfoot>
      </table>

      <div className="amount-block">
        <p className="section-label">Montant total à Payer :</p>
        <p>{totalGNF.toLocaleString('fr-FR')} GNF</p>
      </div>

      <p className="amount-in-words">
        Arrêtée la présente facture à la somme de : {amountInWords}.
      </p>

      <div className="signature">
        <p>Le Service Administratif & Financier</p>
      </div>
    </div>
  )
}
