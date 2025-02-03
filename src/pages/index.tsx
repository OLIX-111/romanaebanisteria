import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useTranslation } from "@/hooks/UseTranslation"

const inter = Inter({ subsets: ['latin'] })

import { getDictionary } from '@/locales/getDictionary'
import { useRouter } from 'next/router';

export default function Home() {

  const dict = useTranslation();

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      {dict.welcome}
    </main>
  )
}
