import { Open_Sans } from "next/font/google"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { ContactInfo } from "@/components/contact/ContactInfo"
import { ContactForm } from "@/components/contact/ContactForm"
import LocationSection from "@/components/contact/Location"
const openSans = Open_Sans({ subsets: ["latin"] })

export default function ContactPage() {
  return (
    <main className={openSans.className}>
      <Header />
      <div className="min-h-screen bg-black py-24">
        <div className="container mx-auto px-4 pt-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-24 items-start">
            <ContactInfo />
            <ContactForm />
          </div>
          <LocationSection/>
        </div>
      </div>
      <Footer />
    </main>
  )
}

