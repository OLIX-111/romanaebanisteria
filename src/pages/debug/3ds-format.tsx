"use client"

import Head from "next/head"
import Link from "next/link"
import { Open_Sans } from "next/font/google"
import { useState } from "react"
import { getProvinceCode, formatPhoneForCardNet } from "@/lib/cardnet"

const openSans = Open_Sans({ subsets: ["latin"] })

export default function ThreeDSFormatPage() {
  const [testForm, setTestForm] = useState({
    email: "marianelsa442@hotmail.com",
    phone: "829-806-2770",
    workPhone: "829-806-2778",
    homePhone: "829-806-2794",
    address: "Calle 1 #4 El Dorado A",
    city: "Santiago",
    province: "Santiago",
    postalCode: "51000"
  })

  const [formatted3DS, setFormatted3DS] = useState<any>(null)

  const formatData = () => {
    const mobilePhone = formatPhoneForCardNet(testForm.phone)
    const workPhone = formatPhoneForCardNet(testForm.workPhone)
    const homePhone = formatPhoneForCardNet(testForm.homePhone)
    const stateCode = getProvinceCode(testForm.province)

    const formatted = {
      "3DS_email": testForm.email,
      "3DS_mobilePhone": mobilePhone,
      "3DS_workPhone": workPhone,
      "3DS_homePhone": homePhone,
      "3DS_billAddr_line1": testForm.address.toUpperCase(),
      "3DS_billAddr_line2": "",
      "3DS_billAddr_line3": testForm.address.toUpperCase(),
      "3DS_billAddr_city": testForm.city.toUpperCase(),
      "3DS_billAddr_state": stateCode,
      "3DS_billAddr_country": "214",
      "3DS_billAddr_postcode": testForm.postalCode,
      "3DS_shipAddr_line1": testForm.address.toUpperCase(),
      "3DS_shipAddr_line2": "",
      "3DS_shipAddr_line3": testForm.address.toUpperCase(),
      "3DS_shipAddr_city": testForm.city.toUpperCase(),
      "3DS_shipAddr_state": stateCode,
      "3DS_shipAddr_country": "214",
      "3DS_shipAddr_postcode": testForm.postalCode,
    }

    setFormatted3DS(formatted)
  }

  return (
    <main className={openSans.className}>
      <Head>
        <title>3DS Format Test | Romana Ebanistería</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">3DS Data Format Test</h1>
          
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Input Form */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Test Input Data</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={testForm.email}
                    onChange={(e) => setTestForm({...testForm, email: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono móvil</label>
                  <input
                    value={testForm.phone}
                    onChange={(e) => setTestForm({...testForm, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="(829) 806-2770"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono trabajo</label>
                  <input
                    value={testForm.workPhone}
                    onChange={(e) => setTestForm({...testForm, workPhone: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="(829) 806-2778"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono casa</label>
                  <input
                    value={testForm.homePhone}
                    onChange={(e) => setTestForm({...testForm, homePhone: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="(829) 806-2794"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    value={testForm.address}
                    onChange={(e) => setTestForm({...testForm, address: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="Calle 1 #4 El Dorado A"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input
                    value={testForm.city}
                    onChange={(e) => setTestForm({...testForm, city: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="Santiago"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                  <select
                    value={testForm.province}
                    onChange={(e) => setTestForm({...testForm, province: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="Distrito Nacional">Distrito Nacional</option>
                    <option value="Santo Domingo">Santo Domingo</option>
                    <option value="Santiago">Santiago</option>
                    <option value="La Romana">La Romana</option>
                    <option value="Puerto Plata">Puerto Plata</option>
                    <option value="San Cristóbal">San Cristóbal</option>
                    <option value="La Vega">La Vega</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                  <input
                    value={testForm.postalCode}
                    onChange={(e) => setTestForm({...testForm, postalCode: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="51000"
                  />
                </div>
                
                <button
                  onClick={formatData}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Format 3DS Data
                </button>
              </div>
            </div>

            {/* Formatted Output */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">CardNet 3DS Format Output</h2>
              
              {formatted3DS ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">✅ Formatted 3DS Data</h3>
                    <p className="text-xs text-green-700 mb-3">This is exactly how the data will be sent to CardNet:</p>
                    <pre className="bg-white border rounded p-3 text-xs overflow-auto">
                      {JSON.stringify(formatted3DS, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">📋 Key Transformations</h3>
                    <div className="text-xs text-blue-800 space-y-1">
                      <p><strong>Phone formatting:</strong> {testForm.phone} → {formatted3DS[&quot;3DS_mobilePhone&quot;]}</p>
                      <p><strong>Province mapping:</strong> {testForm.province} → {formatted3DS[&quot;3DS_billAddr_state&quot;]}</p>
                      <p><strong>Address format:</strong> {testForm.address} → {formatted3DS[&quot;3DS_billAddr_line1&quot;]}</p>
                      <p><strong>Country code:</strong> DO → 214</p>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Validation Rules</h3>
                    <ul className="text-xs text-yellow-800 space-y-1">
                      <li>• Email: Valid email format required</li>
                      <li>• Phones: Must be numeric, 10-15 digits</li>
                      <li>• Addresses: Max 50 chars, uppercase</li>
                      <li>• State: 2-digit province code</li>
                      <li>• Country: 214 for Dominican Republic</li>
                      <li>• Postcode: Required, fallback to 10111</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Click "Format 3DS Data" to see the CardNet format</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Example from CardNet Documentation</h2>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
{`{
  &quot;3DS_email&quot;: &quot;marianelsa442@hotmail.com&quot;,
  &quot;3DS_mobilePhone&quot;: &quot;8298062770&quot;,
  &quot;3DS_workPhone&quot;: &quot;8298062778&quot;,
  &quot;3DS_homePhone&quot;: &quot;8298062794&quot;,
  &quot;3DS_billAddr_line1&quot;: &quot;CALLE 1 #4 EL DORADO A&quot;,
  &quot;3DS_billAddr_line2&quot;: &quot;&quot;,
  &quot;3DS_billAddr_line3&quot;: &quot;CALLE 1 #4 EL DORADO A&quot;,
  &quot;3DS_billAddr_city&quot;: &quot;SANTIAGO&quot;,
  &quot;3DS_billAddr_state&quot;: &quot;25&quot;,
  &quot;3DS_billAddr_country&quot;: &quot;214&quot;,
  &quot;3DS_billAddr_postcode&quot;: &quot;51000&quot;,
  &quot;3DS_shipAddr_line1&quot;: &quot;CALLE 1 #4 EL DORADO 1&quot;,
  &quot;3DS_shipAddr_line2&quot;: &quot;&quot;,
  &quot;3DS_shipAddr_line3&quot;: &quot;CALLE 1 #4 EL DORADO 1&quot;,
  &quot;3DS_shipAddr_city&quot;: &quot;SANTIAGO&quot;,
  &quot;3DS_shipAddr_state&quot;: &quot;25&quot;,
  &quot;3DS_shipAddr_country&quot;: &quot;214&quot;,
  &quot;3DS_shipAddr_postcode&quot;: &quot;51000&quot;
}`}
            </pre>
          </div>

          <div className="mt-6">
            <Link 
              href="/debug/test-cardnet" 
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
            >
              🧪 Test CardNet Session
            </Link>
            <Link 
              href="/store/checkout" 
              className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 ml-3 text-sm"
            >
              🛒 Back to Checkout
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
