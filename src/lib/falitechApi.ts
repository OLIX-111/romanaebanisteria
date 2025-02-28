// lib/falitechApi.ts

export async function createSubscriber(payload: {
    first_name?: string
    last_name?: string
    phone?: string
    email?: string
    gender?: string
    image?: string
  }) {
    const url = `${process.env.FALITECH_API_URL}/subscriber/create`
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FALITECH_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
  
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      throw new Error(`createSubscriber failed: ${res.status} - ${JSON.stringify(errorBody)}`)
    }
  
    return res.json()
  }
  
  export async function addToCart(user_ns: string, variant_id: number, qty: number) {
    const url = `${process.env.FALITECH_API_URL}/subscriber/add-to-cart`
    const payload = { user_ns, variant_id, qty }
  
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FALITECH_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
  
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      throw new Error(`addToCart failed: ${res.status} - ${JSON.stringify(errorBody)}`)
    }
  
    return res.json() // { status: "ok" }
  }
  
  export async function getCart(user_ns: string) {
    const url = `${process.env.FALITECH_API_URL}/subscriber/cart?user_ns=${encodeURIComponent(user_ns)}`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.FALITECH_API_KEY}`
      }
    })
  
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      throw new Error(`getCart failed: ${res.status} - ${JSON.stringify(errorBody)}`)
    }
  
    return res.json()
  }
  
  export async function emptyCart(user_ns: string) {
    const url = `${process.env.FALITECH_API_URL}/subscriber/empty-cart`
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.FALITECH_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ user_ns })
    })
  
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      throw new Error(`emptyCart failed: ${res.status} - ${JSON.stringify(errorBody)}`)
    }
  
    return res.json() // { status: "ok" }
  }
  