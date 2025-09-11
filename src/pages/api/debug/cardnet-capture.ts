import type { NextApiRequest, NextApiResponse } from "next"

// This endpoint captures all data sent by CardNet for debugging purposes
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const timestamp = new Date().toISOString()
  
  // Capture all possible data
  const debugData = {
    timestamp,
    method: req.method,
    url: req.url,
    query: req.query,
    body: req.body,
    headers: {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length'],
      'user-agent': req.headers['user-agent'],
      'referer': req.headers['referer'],
      'origin': req.headers['origin'],
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip'],
    },
    // Look for SESSION in all possible places
    sessionDetection: {
      queryUpper: req.query?.SESSION,
      queryLower: req.query?.session,
      bodyUpper: req.body?.SESSION,
      bodyLower: req.body?.session,
      allQueryKeys: Object.keys(req.query || {}),
      allBodyKeys: Object.keys(req.body || {}),
    }
  }

  console.log("[CardNet Debug Capture]", debugData)

  // Try to extract SESSION from any source
  const sessionId = req.query?.SESSION || req.query?.session || req.body?.SESSION || req.body?.session || ""

  if (sessionId) {
    // Redirect to success page with SESSION
    console.log(`[CardNet Debug] SESSION found: ${sessionId}, redirecting to success`)
    return res.redirect(302, `/notify/success?SESSION=${encodeURIComponent(sessionId as string)}`)
  } else {
    // Redirect to debug page to show all captured data
    console.log("[CardNet Debug] No SESSION found, redirecting to debug page")
    
    // Store debug data in a way that can be accessed by the debug page
    // For simplicity, we'll pass it as query parameters (in production, use a proper store)
    const debugQuery = new URLSearchParams({
      method: req.method || "UNKNOWN",
      hasQuery: Object.keys(req.query || {}).length > 0 ? "true" : "false",
      hasBody: Object.keys(req.body || {}).length > 0 ? "true" : "false",
      queryKeys: Object.keys(req.query || {}).join(","),
      bodyKeys: Object.keys(req.body || {}).join(","),
      timestamp,
    }).toString()
    
    return res.redirect(302, `/debug/cardnet-return?${debugQuery}`)
  }
}
