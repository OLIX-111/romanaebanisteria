import type { NextApiRequest, NextApiResponse } from "next"
import { cardnetEnv } from "@/lib/cardnet"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"])
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const config = cardnetEnv()
    const recommendations: string[] = []

    // Check environment variables
    const envVars = {
      CARDNET_ENV: process.env.CARDNET_ENV,
      PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL,
      CARDNET_CURRENCY: process.env.CARDNET_CURRENCY,
      CARDNET_PAGE_LANG: process.env.CARDNET_PAGE_LANG,
      CARDNET_MERCHANT_OWNER: process.env.CARDNET_MERCHANT_OWNER,
      CARDNET_MERCHANT_CITY: process.env.CARDNET_MERCHANT_CITY,
      CARDNET_MERCHANT_STATE: process.env.CARDNET_MERCHANT_STATE,
      CARDNET_MERCHANT_COUNTRY: process.env.CARDNET_MERCHANT_COUNTRY,
    }

    // Environment-specific variables
    if (config.env === 'lab') {
      Object.assign(envVars, {
        CARDNET_LAB_BASE_URL: process.env.CARDNET_LAB_BASE_URL,
        CARDNET_LAB_MERCHANT_NUMBER: process.env.CARDNET_LAB_MERCHANT_NUMBER,
        CARDNET_LAB_TERMINAL_ID: process.env.CARDNET_LAB_TERMINAL_ID,
        CARDNET_LAB_MERCHANT_TYPE: process.env.CARDNET_LAB_MERCHANT_TYPE,
        CARDNET_LAB_ACQUIRER: process.env.CARDNET_LAB_ACQUIRER,
      })
    } else {
      Object.assign(envVars, {
        CARDNET_PROD_BASE_URL: process.env.CARDNET_PROD_BASE_URL,
        CARDNET_PROD_MERCHANT_NUMBER: process.env.CARDNET_PROD_MERCHANT_NUMBER,
        CARDNET_PROD_TERMINAL_ID: process.env.CARDNET_PROD_TERMINAL_ID,
        CARDNET_PROD_MERCHANT_TYPE: process.env.CARDNET_PROD_MERCHANT_TYPE,
        CARDNET_PROD_ACQUIRER: process.env.CARDNET_PROD_ACQUIRER,
      })
    }

    // Generate recommendations
    if (!process.env.PUBLIC_BASE_URL) {
      recommendations.push("Set PUBLIC_BASE_URL environment variable for proper return URLs")
    }

    if (config.env === 'prod' && !process.env.CARDNET_PROD_MERCHANT_NUMBER) {
      recommendations.push("Production merchant credentials not configured")
    }

    const publicBaseUrl = process.env.PUBLIC_BASE_URL || 'https://www.romanaebanisteria.com'
    const returnUrl = `${publicBaseUrl}/api/debug/cardnet-capture`
    const cancelUrl = `${publicBaseUrl}/api/debug/cardnet-capture`

    const response = {
      timestamp: new Date().toISOString(),
      environment: config.env,
      baseUrl: config.baseUrl,
      merchantNumber: config.merchantNumber,
      terminalId: config.terminalId,
      merchantType: config.merchantType,
      acquirer: config.acquirer,
      returnUrl,
      cancelUrl,
      currency: process.env.CARDNET_CURRENCY || "214",
      language: process.env.CARDNET_PAGE_LANG || "ESP",
      merchantInfo: {
        owner: process.env.CARDNET_MERCHANT_OWNER || "ROMANA EBANISTERIA SRL",
        city: process.env.CARDNET_MERCHANT_CITY || "LA ROMANA",
        state: process.env.CARDNET_MERCHANT_STATE || "   ",
        country: process.env.CARDNET_MERCHANT_COUNTRY || "DO",
      },
      envVars,
      recommendations,
      configValid: !recommendations.length,
    }

    return res.status(200).json(response)

  } catch (error: any) {
    console.error("[CardNet Config Debug] Error:", error)
    return res.status(500).json({ 
      error: "Error checking configuration",
      details: error.message 
    })
  }
}
