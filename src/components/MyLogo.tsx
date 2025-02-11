// components/MyCustomLogo.tsx
import React from 'react'

const MyCustomLogo = () => {
  return (
      <img
        src="/romanaEbanistería-alt.png" // O la ruta que corresponda (puede estar en /public)
        alt="RE"
        style={{ width: '25px', height: '25px', objectFit: 'contain' }}
      />
  )
}

export default MyCustomLogo
