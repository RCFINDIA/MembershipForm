"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, RefreshCcw, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"

interface Chapter {
  _id: string
  name: string
  type: string
  defaultStatus: string
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export default function ChapterSelectionPage() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchChapters()
  }, [])

  // Filter chapters when search changes
  useEffect(() => {
    if (chapters.length) {
      const filtered = chapters.filter((chapter) => chapter.name.toLowerCase().includes(search.toLowerCase()))
      setFilteredChapters(filtered)
    }
  }, [search, chapters])

  const fetchChapters = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("https://api.rolbol.org/api/v1/centerandsubcenter/allActive")

      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`)
      }

      const data = await response.json()

      if (data.status && data.data) {
        // Filter only CHAPTER type entries
        const chaptersOnly = data.data.filter((item: Chapter) => item.type === "CHAPTER")
        setChapters(chaptersOnly)
        setFilteredChapters(chaptersOnly)
      } else {
        setError("Failed to load chapters. Please try again.")
      }
    } catch (err) {
      console.error("Error fetching chapters:", err)
      setError("Could not connect to the server. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChapterSelect = (chapter: Chapter) => {
    // Encode the chapter name and ID for URL safety
    const encodedChapterName = encodeURIComponent(chapter.name)
    const encodedChapterId = encodeURIComponent(chapter._id)

    // Navigate to membership form with chapter info
    router.push(`/?chapter=${encodedChapterName}&chapterId=${encodedChapterId}`)
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative py-12">
      {/* Background gradient */}
      <div className="fixed inset-0 z-0">
        <div className="absolute -top-[14%] left-0 right-0 w-full h-[400px] opacity-30 mix-blend-screen">
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
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-blue-900/10 to-black"></div>
      </div>

      {/* Content container */}
      <div className="relative z-10 w-full max-w-xl px-4 mx-auto">
        {/* Header section */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-4">
            ROLBOL
          </h1>
          <p className="text-xl text-gray-300 mb-2">Membership Registration</p>
          <p className="text-gray-400 max-w-md mx-auto">Select your chapter to begin the registration process</p>
        </div>

        {/* Main card */}
        <div className="bg-[#f5f5f5]/5 backdrop-blur-[20px] rounded-lg shadow-glow p-6 md:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-purple-500 mb-4" />
              <p className="text-gray-300">Loading chapters...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-900/20 text-red-300 p-4 rounded-lg mb-4 backdrop-blur-sm">
                <p className="mb-2">{error}</p>
                <p className="text-sm text-red-400">Please try again or contact support if the issue persists.</p>
              </div>
              <button
                onClick={fetchChapters}
                className="bg-[#7c29ff]/80 hover:bg-[#7c29ff]/90 backdrop-blur-sm text-white px-4 py-2 rounded-md shadow-glow transition-all flex items-center justify-center mx-auto"
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Search box */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search chapters..."
                  className="pl-10 bg-[#2e2e2e] border-0 text-gray-200 focus-visible:ring-1 focus-visible:ring-purple-500 focus-visible:ring-offset-0"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {filteredChapters.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                  {filteredChapters.map((chapter) => (
                    <button
                      key={chapter._id}
                      onClick={() => handleChapterSelect(chapter)}
                      className="group w-full bg-[#2e2e2e] hover:bg-[#3a3a3a] text-left py-4 px-4 rounded-md transition-all text-white"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{chapter.name}</span>
                        <span className="h-6 w-6 rounded-full bg-[#7c29ff]/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <p>No chapters found matching "{search}"</p>
                  <button onClick={() => setSearch("")} className="text-purple-400 hover:underline mt-2">
                    Clear search
                  </button>
                </div>
              )}

              {chapters.length > 0 && (
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Showing {filteredChapters.length} of {chapters.length} chapters
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
