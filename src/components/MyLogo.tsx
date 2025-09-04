// components/MyCustomLogo.tsx
import React from 'react'
import Image from 'next/image'

const MyCustomLogo = () => {
  return (
    <Image
      src="/romanaEbanistería-alt.png"
      alt="Romana Ebanistería"
      width={25}
      height={25}
      style={{ objectFit: 'contain' }}
      priority
    />
  )
}

export default MyCustomLogo
