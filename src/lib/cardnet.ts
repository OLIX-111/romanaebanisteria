import { z } from 'zup'

// Types for CardNET API
export interface CardnetConfig {
  publicKey: string
  privateKey: string
  baseUrl: string
  labMode: boolean
}

export interface PurchaseRequest {
  TrxToken: string
  Amount: number
  Currency: string
  DataDo: {
    Invoice: string
    Tax?: string
  }
  UniqueID?: string
  Capture: boolean
}

export interface CustomerRequest {
  Email: string
  FirstName: string
  LastName: string
  PhoneNumber: string
}

export interface CustomerActivation {
  Token: string
  ActivationCode: string
}

export interface PurchaseResponse {
  PurchaseId: string
  Status: 'Approved' | 'Declined' | 'Pending'
  ApprovalCode?: string
  CommerceAction?: string
  ResponseMessage?: string
}

export interface CustomerResponse {
  CustomerId: string
  CaptureURL: string
  UniqueID: string
  Status: string
}

export interface ActivationResponse {
  Success: boolean
  Message: string
}

// Zod schemas for validation
export const purchaseSchema = z.object({
  TrxToken: z.string().min(1),
  Amount: z.number().positive(),
  Currency: z.string().default('DOP'),
  DataDo: z.object({
    Invoice: z.string().min(1),
    Tax: z.string().optional()
  }),
  UniqueID: z.string().optional(),
  Capture: z.boolean().default(true)
})

export const customerSchema = z.object({
  Email: z.string().email(),
  FirstName: z.string().min(1),
  LastName: z.string().min(1),
  PhoneNumber: z.string().min(1)
})

export const activationSchema = z.object({
  Token: z.string().min(1),
  ActivationCode: z.string().min(1)
})

// CardNET configuration
const config: CardnetConfig = {
  publicKey: process.env.NEXT_PUBLIC_CARDNET_PUBLIC_KEY!,
  privateKey: process.env.CARDNET_PRIVATE_KEY!,
  baseUrl: process.env.NODE_ENV === 'production'
    ? 'https://cardnet.com.do'
    : 'https://lab.cardnet.com.do',
  labMode: process.env.NODE_ENV !== 'production'
}

// Helper function to create Basic Auth header
function createBasicAuth(): string {
  const credentials = Buffer.from(`${config.privateKey}:`).toString('base64')
  return `Basic ${credentials}`
}

// Helper function to make authenticated requests to CardNET API
async function cardnetRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any
): Promise<T> {
  const url = `${config.baseUrl}/v1/api${endpoint}`

  const headers: Record<string, string> = {
    'Authorization': createBasicAuth(),
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }

  const requestOptions: RequestInit = {
    method,
    headers
  }

  if (body && method === 'POST') {
    requestOptions.body = JSON.stringify(body)
  }

  const response = await fetch(url, requestOptions)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`CardNET API Error: ${response.status} - ${errorData.message || 'Unknown error'}`)
  }

  return response.json()
}

// Purchase operations
export async function createPurchase(request: PurchaseRequest): Promise<PurchaseResponse> {
  const validatedData = purchaseSchema.parse(request)

  // Generate UniqueID if not provided
  if (!validatedData.UniqueID) {
    validatedData.UniqueID = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  return cardnetRequest<PurchaseResponse>('/purchase', 'POST', validatedData)
}

export async function getPurchase(purchaseId: string): Promise<PurchaseResponse> {
  return cardnetRequest<PurchaseResponse>(`/purchase/${purchaseId}`)
}

export async function commitPurchase(purchaseId: string): Promise<PurchaseResponse> {
  return cardnetRequest<PurchaseResponse>(`/purchase/${purchaseId}/commit`, 'POST')
}

export async function refundPurchase(purchaseId: string): Promise<PurchaseResponse> {
  return cardnetRequest<PurchaseResponse>(`/purchase/${purchaseId}/refund`, 'POST')
}

// Customer operations
export async function createCustomer(request: CustomerRequest): Promise<CustomerResponse> {
  const validatedData = customerSchema.parse(request)
  return cardnetRequest<CustomerResponse>('/customer', 'POST', validatedData)
}

export async function getCustomer(customerId: string): Promise<CustomerResponse> {
  return cardnetRequest<CustomerResponse>(`/customer/${customerId}`)
}

export async function activateCustomerPayment(
  customerId: string,
  activation: CustomerActivation
): Promise<ActivationResponse> {
  const validatedData = activationSchema.parse(activation)
  return cardnetRequest<ActivationResponse>(
    `/customer/${customerId}/activate`,
    'POST',
    validatedData
  )
}

// Utility functions
export function generateUniqueId(prefix: string = 'ORD'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function formatAmount(amount: number): string {
  // Convert to cents for CardNET (they expect amount in minor units)
  return Math.round(amount * 100).toString().padStart(12, '0')
}

export function parseAmount(amountString: string): number {
  // Convert from CardNET format (cents) to dollars
  return parseInt(amountString) / 100
}

export { config }
