import type { NextApiRequest, NextApiResponse } from 'next'
import { createPurchase, generateUniqueId, PurchaseRequest } from '@/lib/cardnet'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const {
      trxToken,
      amount,
      currency = 'DOP',
      invoice,
      tax,
      capture = true
    }: {
      trxToken: string
      amount: number
      currency?: string
      invoice: string
      tax?: string
      capture?: boolean
    } = req.body

    // Validate required fields
    if (!trxToken || !amount || !invoice) {
      return res.status(400).json({
        error: 'Datos insuficientes',
        required: ['trxToken', 'amount', 'invoice']
      })
    }

    // Create purchase request
    const purchaseRequest: PurchaseRequest = {
      TrxToken: trxToken,
      Amount: amount,
      Currency: currency,
      DataDo: {
        Invoice: invoice,
        Tax: tax
      },
      UniqueID: generateUniqueId(),
      Capture: capture
    }

    // Execute purchase
    const result = await createPurchase(purchaseRequest)

    // Handle different statuses
    switch (result.Status) {
      case 'Approved':
        return res.status(200).json({
          success: true,
          purchaseId: result.PurchaseId,
          approvalCode: result.ApprovalCode,
          status: 'approved',
          message: 'Pago aprobado exitosamente'
        })

      case 'Declined':
        return res.status(200).json({
          success: false,
          status: 'declined',
          message: result.ResponseMessage || 'Pago rechazado'
        })

      case 'Pending':
        return res.status(200).json({
          success: true,
          purchaseId: result.PurchaseId,
          status: 'pending',
          commerceAction: result.CommerceAction,
          message: 'Pago pendiente de procesamiento'
        })

      default:
        return res.status(200).json({
          success: false,
          status: 'unknown',
          message: 'Estado de pago desconocido'
        })
    }

  } catch (error: any) {
    console.error('CardNET Purchase Error:', error)

    // Handle specific CardNET errors
    if (error.message.includes('CardNET API Error')) {
      return res.status(400).json({
        error: 'Error en el procesamiento del pago',
        details: error.message
      })
    }

    return res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    })
  }
}
