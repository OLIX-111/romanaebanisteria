import type { NextApiRequest, NextApiResponse } from 'next'
import { activateCustomerPayment, CustomerActivation } from '@/lib/cardnet'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const {
      customerId,
      token,
      activationCode
    }: {
      customerId: string
      token: string
      activationCode: string
    } = req.body

    if (!customerId || !token || !activationCode) {
      return res.status(400).json({
        error: 'Datos insuficientes',
        required: ['customerId', 'token', 'activationCode']
      })
    }

    const activation: CustomerActivation = {
      Token: token,
      ActivationCode: activationCode
    }

    const result = await activateCustomerPayment(customerId, activation)

    if (result.Success) {
      return res.status(200).json({
        success: true,
        message: 'Tarjeta activada exitosamente'
      })
    } else {
      return res.status(400).json({
        success: false,
        message: result.Message || 'Error al activar la tarjeta'
      })
    }

  } catch (error: any) {
    console.error('CardNET Activation Error:', error)

    if (error.message.includes('CardNET API Error')) {
      return res.status(400).json({
        error: 'Error en la activación de tarjeta',
        details: error.message
      })
    }

    return res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    })
  }
}
