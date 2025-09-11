"use client"

import { useState } from "react"
import Head from "next/head"
import { Open_Sans } from "next/font/google"
import { Play, CheckCircle, XCircle, Loader2 } from "lucide-react"

const openSans = Open_Sans({ subsets: ["latin"] })

export default function TestCardNetPage() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any>(null)

  const testCardNetFlow = async () => {
    setTesting(true)
    setResults(null)

    try {
      // Test data with EXACT CardNet 3DS format
      const testData = {
        orderId: `TEST-${Date.now()}`,
        amount: 100, // RD$1.00 for testing
        tax: 0,
        threeDS: {
          email: "test@romanaebanisteria.com",
          mobilePhone: "18298062770",
          workPhone: "18298062778", 
          homePhone: "18298062794",
          billAddr_line1: "CALLE 1 #4 EL DORADO A",
          billAddr_line2: "",
          billAddr_line3: "CALLE 1 #4 EL DORADO A",
          billAddr_city: "SANTIAGO",
          billAddr_state: "25", // Santiago province code
          billAddr_country: "214", // Dominican Republic
          billAddr_postcode: "51000",
          shipAddr_line1: "CALLE 1 #4 EL DORADO A",
          shipAddr_line2: "",
          shipAddr_line3: "CALLE 1 #4 EL DORADO A", 
          shipAddr_city: "SANTIAGO",
          shipAddr_state: "25",
          shipAddr_country: "214",
          shipAddr_postcode: "51000",
        }
      }

      console.log("Testing CardNet session creation with:", testData)

      const response = await fetch("/api/payments/cardnet/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      })

      const data = await response.json()

      setResults({
        success: response.ok,
        status: response.status,
        data,
        testData,
      })

      if (response.ok) {
        console.log("Session created successfully:", data)
        // Don't auto-redirect in test mode
      } else {
        console.error("Session creation failed:", data)
      }

    } catch (error: any) {
      console.error("Test failed:", error)
      setResults({
        success: false,
        error: error.message,
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <main className={openSans.className}>
      <Head>
        <title>Test CardNet Integration | Romana Ebanistería</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Test CardNet Integration</h1>
          
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Session Creation Test</h2>
            <p className="text-gray-600 mb-4">
              This will test creating a CardNet payment session with test data (RD$1.00).
            </p>
            
            <button
              onClick={testCardNetFlow}
              disabled={testing}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Test Session Creation
                </>
              )}
            </button>
          </div>

          {results && (
            <div className="bg-white rounded-lg border p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                Test Results
                {results.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Status: {results.status}</p>
                  <p className="text-sm text-gray-600">
                    {results.success ? "✅ Session created successfully" : "❌ Session creation failed"}
                  </p>
                </div>

                {results.success && results.data && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">Session Details</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Session ID:</strong> {results.data.sessionId}</p>
                      <p><strong>Authorize URL:</strong> {results.data.authorizeUrl}</p>
                      <p><strong>Order ID:</strong> {results.data.orderId}</p>
                      <p><strong>Transaction ID:</strong> {results.data.transactionId}</p>
                    </div>
                    
                    <div className="mt-4">
                      <a 
                        href={`${results.data.authorizeUrl}?SESSION=${results.data.sessionId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                      >
                        🔗 Test Payment Gateway (Opens in new tab)
                      </a>
                    </div>
                  </div>
                )}

                {!results.success && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-900 mb-2">Error Details</h3>
                    <pre className="text-sm text-red-800 whitespace-pre-wrap">
                      {JSON.stringify(results.data || results.error, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Test Data Used</h3>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify(results.testData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Debug Steps</h3>
            <ol className="space-y-2 text-sm text-blue-800">
              <li>1. <a href="/debug/cardnet-config" className="underline hover:no-underline">Check configuration status</a></li>
              <li>2. Test session creation (button above)</li>
              <li>3. If session works, test the payment gateway link</li>
              <li>4. Check server logs for any errors</li>
              <li>5. Verify return URLs are reachable from CardNet</li>
            </ol>
          </div>

          <div className="mt-6 space-y-2">
            <a 
              href="/debug/cardnet-config" 
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
            >
              📋 Check Configuration
            </a>
            <a 
              href="/store/checkout" 
              className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 ml-3 text-sm"
            >
              🛒 Back to Checkout
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
