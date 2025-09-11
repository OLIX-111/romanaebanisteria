"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Link from "next/link"
import { Open_Sans } from "next/font/google"

const openSans = Open_Sans({ subsets: ["latin"] })

export default function CardNetDebugPage() {
  const router = useRouter()
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    // Capture all query parameters and any other relevant info
    const info = {
      timestamp: new Date().toISOString(),
      query: router.query,
      asPath: router.asPath,
      pathname: router.pathname,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      referrer: typeof document !== 'undefined' ? document.referrer : 'N/A',
      location: typeof window !== 'undefined' ? window.location.href : 'N/A',
      // Extract specific debug info from query params
      debugInfo: {
        method: router.query.method,
        hasQuery: router.query.hasQuery,
        hasBody: router.query.hasBody,
        queryKeys: router.query.queryKeys,
        bodyKeys: router.query.bodyKeys,
        serverTimestamp: router.query.timestamp,
      }
    }
    
    setDebugInfo(info)
    console.log("[CardNet Debug] Full info:", info)
  }, [router])

  if (!debugInfo) {
    return <div className="p-8">Loading debug info...</div>
  }

  return (
    <main className={openSans.className}>
      <Head>
        <title>CardNet Debug | Romana Ebanistería</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">CardNet Return Debug</h1>
          
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Request Information</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">SESSION Detection</h2>
            <div className="space-y-2 text-sm">
              <p><strong>SESSION (uppercase):</strong> {debugInfo.query?.SESSION || 'Not found'}</p>
              <p><strong>session (lowercase):</strong> {debugInfo.query?.session || 'Not found'}</p>
              <p><strong>All query keys:</strong> {Object.keys(debugInfo.query || {}).join(', ') || 'None'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Server Debug Info</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Server Method:</strong> {debugInfo.debugInfo?.method || 'Not captured'}</p>
              <p><strong>Had Query Params:</strong> {debugInfo.debugInfo?.hasQuery || 'Unknown'}</p>
              <p><strong>Had Body Data:</strong> {debugInfo.debugInfo?.hasBody || 'Unknown'}</p>
              <p><strong>Query Keys on Server:</strong> {debugInfo.debugInfo?.queryKeys || 'None'}</p>
              <p><strong>Body Keys on Server:</strong> {debugInfo.debugInfo?.bodyKeys || 'None'}</p>
              <p><strong>Server Timestamp:</strong> {debugInfo.debugInfo?.serverTimestamp || 'Not captured'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Current URL:</strong> {debugInfo.location}</p>
              <p><strong>Referrer:</strong> {debugInfo.referrer}</p>
              <p><strong>User Agent:</strong> {debugInfo.userAgent}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
            <div className="space-y-3">
              <p>1. Check if SESSION parameter is present in any form</p>
              <p>2. Verify CardNet is sending data to the correct URL</p>
              <p>3. Check server logs for the /api/payments/cardnet/return endpoint</p>
              
              <div className="mt-6 space-y-2">
                <Link 
                  href="/store/checkout" 
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Try Payment Again
                </Link>
                <Link 
                  href="/store/cart" 
                  className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 ml-3"
                >
                  Back to Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
