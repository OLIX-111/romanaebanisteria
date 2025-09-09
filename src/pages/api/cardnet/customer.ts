import type { NextApiRequest, NextApiResponse } from 'next'
import { createCustomer, getCustomer, CustomerRequest } from '@/lib/cardnet'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      // Create new customer
      const {
        email,
        firstName,
        lastName,
        phoneNumber
      }: {
        email: string
        firstName: string
        lastName: string
        phoneNumber: string
      } = req.body

      if (!email || !firstName || !lastName || !phoneNumber) {
        return res.status(400).json({
          error: 'Datos insuficientes',
          required: ['email', 'firstName', 'lastName', 'phoneNumber']
        })
      }

      const customerRequest: CustomerRequest = {
        Email: email,
        FirstName: firstName,
        LastName: lastName,
        PhoneNumber: phoneNumber
      }

      const result = await createCustomer(customerRequest)

      return res.status(201).json({
        success: true,
        customerId: result.CustomerId,
        captureUrl: result.CaptureURL,
        uniqueId: result.UniqueID,
        status: result.Status
      })

    } else if (req.method === 'GET') {
      // Get existing customer
      const { customerId } = req.query

      if (!customerId || typeof customerId !== 'string') {
        return res.status(400).json({
          error: 'CustomerId requerido'
        })
      }

      const result = await getCustomer(customerId)

      return res.status(200).json({
        success: true,
        customerId: result.CustomerId,
        captureUrl: result.CaptureURL,
        uniqueId: result.UniqueID,
        status: result.Status
      })

    } else {
      return res.status(405).json({ error: 'Método no permitido' })
    }

  } catch (error: any) {
    console.error('CardNET Customer Error:', error)

    if (error.message.includes('CardNET API Error')) {
      return res.status(400).json({
        error: 'Error en la gestión del cliente',
        details: error.message
      })
    }

    return res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    })
  }
}
