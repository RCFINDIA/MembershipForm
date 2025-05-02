"use client"

import { useSearchParams } from "next/navigation"
import MembershipForm from "@/components/membership-form"
import Image from "next/image"
import { useState, useEffect } from "react"

export default function Home() {
  const searchParams = useSearchParams()
  const hasChapter = searchParams.has("chapter")
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking")

  // Check if the API is available
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // Use a simple endpoint to check API availability
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // 8-second timeout (reduced from 5s)

        try {
          const response = await fetch("https://api.rolbol.org/api/v1/centerandsubcenter/allActive", {
            method: "GET",
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          // Check if response is OK
          if (response.ok) {
            setApiStatus("online")
          } else {
            console.warn("API returned error status:", response.status)
            setApiStatus("offline")
          }
        } catch (error) {
          clearTimeout(timeoutId)
          console.warn("API appears to be offline:", error)
          setApiStatus("offline")
        }
      } catch (error) {
        console.warn("Error checking API status:", error)
        setApiStatus("offline")
      }
    }

    checkApiStatus()
  }, [])

  return (
    <main className="min-h-screen bg-black text-white py-8 relative">
      {/* Background gradient - using Image component for better reliability */}
      <div className="fixed -top-[14%] left-0 right-0 w-full h-[400px] opacity-30 mix-blend-screen z-0 overflow-hidden">
        <Image
          src="/images/bggradient.png"
          alt="Background Gradient"
          fill
          priority
          style={{
            objectFit: "cover",
            objectPosition: "center top",
          }}
        />
      </div>

      {/* Content container */}
      <div className="container mx-auto !px-[10px] relative z-10">
        {apiStatus === "offline" && (
          <div className="bg-amber-900/70 text-amber-100 px-4 py-3 rounded-md mb-4 backdrop-blur-sm">
            <p className="text-sm">
              Note: The server appears to be unavailable or experiencing high traffic. Your form will be submitted when
              the server becomes available.
            </p>
          </div>
        )}

        {hasChapter ? (
          <MembershipForm />
        ) : (
          <div className="h-screen -mt-[80px] flex flex-col justify-center items-center">
            <h1 className="text-[40px]">Welcome to ROLBOL</h1>
            <p>Register Now</p>
          </div>
        )}
      </div>
    </main>
  )
}
