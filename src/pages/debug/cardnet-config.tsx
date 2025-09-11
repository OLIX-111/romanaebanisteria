"use client"

import Head from "next/head"
import { Open_Sans } from "next/font/google"
import { useEffect, useState } from "react"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

const openSans = Open_Sans({ subsets: ["latin"] })

export default function CardNetConfigDebugPage() {
  const [configStatus, setConfigStatus] = useState<any>(null)

  useEffect(() => {
    // Check configuration status
    fetch('/api/debug/cardnet-config')
      .then(res => res.json())
      .then(data => setConfigStatus(data))
      .catch(err => setConfigStatus({ error: err.message }))
  }, [])

  const StatusIcon = ({ status }: { status: 'ok' | 'warning' | 'error' }) => {
    switch (status) {
      case 'ok': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />
    }
  }

  const StatusRow = ({ label, value, status, description }: { 
    label: string, 
    value: any, 
    status: 'ok' | 'warning' | 'error',
    description?: string 
  }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100">
      <StatusIcon status={status} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">{label}</span>
          <span className="text-sm text-gray-600 font-mono">{String(value)}</span>
        </div>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
    </div>
  )

  if (!configStatus) {
    return (
      <main className={openSans.className}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando configuración...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={openSans.className}>
      <Head>
        <title>CardNet Configuration Debug | Romana Ebanistería</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">CardNet Configuration Debug</h1>
          
          {configStatus.error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-500" />
                <div>
                  <h2 className="text-lg font-semibold text-red-900">Configuration Error</h2>
                  <p className="text-red-700">{configStatus.error}</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg border p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Environment Configuration</h2>
                <div className="space-y-1">
                  <StatusRow 
                    label="Environment" 
                    value={configStatus.environment || 'Not set'} 
                    status={configStatus.environment ? 'ok' : 'error'}
                    description="Should be 'lab' for testing or 'prod' for production"
                  />
                  <StatusRow 
                    label="Base URL" 
                    value={configStatus.baseUrl || 'Not set'} 
                    status={configStatus.baseUrl ? 'ok' : 'error'}
                    description="CardNet API endpoint"
                  />
                  <StatusRow 
                    label="Merchant Number" 
                    value={configStatus.merchantNumber || 'Not set'} 
                    status={configStatus.merchantNumber ? 'ok' : 'error'}
                    description="Your CardNet merchant identifier"
                  />
                  <StatusRow 
                    label="Terminal ID" 
                    value={configStatus.terminalId || 'Not set'} 
                    status={configStatus.terminalId ? 'ok' : 'error'}
                    description="Your CardNet terminal identifier"
                  />
                  <StatusRow 
                    label="Return URL" 
                    value={configStatus.returnUrl || 'Not set'} 
                    status={configStatus.returnUrl ? 'ok' : 'error'}
                    description="Where CardNet will send successful payments"
                  />
                  <StatusRow 
                    label="Cancel URL" 
                    value={configStatus.cancelUrl || 'Not set'} 
                    status={configStatus.cancelUrl ? 'ok' : 'error'}
                    description="Where CardNet will send cancelled payments"
                  />
                </div>
              </div>

              {configStatus.recommendations && configStatus.recommendations.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                  <h2 className="text-lg font-semibold text-yellow-900 mb-3">Recommendations</h2>
                  <ul className="space-y-2">
                    {configStatus.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-yellow-800">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Use these links to test the payment flow:</p>
              
              <div className="space-y-2">
                <a 
                  href="/store/checkout" 
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                >
                  Test Payment Flow
                </a>
                <a 
                  href="/api/debug/cardnet-capture?test=true" 
                  className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 ml-3 text-sm"
                >
                  Test Return Handler
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
