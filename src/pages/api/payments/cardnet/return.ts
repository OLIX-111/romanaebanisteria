import type { NextApiRequest, NextApiResponse } from "next"

// This API handles CardNet returns (both GET and POST) and redirects appropriately
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let sessionId: string = ""
    let returnType: "success" | "cancelled" = "success"

    if (req.method === "GET") {
      // Handle GET parameters
      sessionId = (req.query.SESSION as string) || (req.query.session as string) || ""
      returnType = req.query.type === "cancelled" ? "cancelled" : "success"
    } else if (req.method === "POST") {
      // Handle POST parameters (CardNet might send SESSION via POST)
      sessionId = req.body?.SESSION || req.body?.session || ""
      returnType = req.body?.type === "cancelled" ? "cancelled" : "success"
    } else {
      res.setHeader("Allow", ["GET", "POST"])
      return res.status(405).json({ error: "Method not allowed" })
    }

    console.log(`[CardNet Return] Method: ${req.method}, SESSION: ${sessionId}, Type: ${returnType}`)
    console.log(`[CardNet Return] Full request data:`, { 
      method: req.method, 
      query: req.query, 
      body: req.body,
      headers: {
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent'],
      }
    })

    if (!sessionId) {
      console.error("[CardNet Return] SESSION parameter missing", { 
        method: req.method, 
        query: req.query, 
        body: req.body 
      })
      
      // Redirect to cancelled page with error
      return res.redirect(302, "/notify/cancelled?error=session_missing")
    }

    // For debugging: redirect to debug page first to see what CardNet is sending
    // TODO: Remove this debug redirect and uncomment the normal flow below
    const debugUrl = `/debug/cardnet-return?SESSION=${encodeURIComponent(sessionId)}&type=${returnType}&method=${req.method}`
    console.log(`[CardNet Return] DEBUG: Redirecting to: ${debugUrl}`)
    return res.redirect(302, debugUrl)

    // Normal flow (uncomment after debugging):
    // const redirectUrl = `/notify/${returnType}?SESSION=${encodeURIComponent(sessionId)}`
    // console.log(`[CardNet Return] Redirecting to: ${redirectUrl}`)
    // return res.redirect(302, redirectUrl)

  } catch (error: any) {
    console.error("[CardNet Return] Exception:", error)
    return res.redirect(302, "/notify/cancelled?error=processing_error")
  }
}
