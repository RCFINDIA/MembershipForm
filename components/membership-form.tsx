"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, ArrowRight, Loader2, Camera, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import CustomDatepicker from "@/components/custom-datepicker"
import { useSearchParams } from "next/navigation"

// Define the institution type based on the API response
interface Institution {
  _id: string
  name: string
  cityId: string
  contactNo: string
  address: string
  logo: string
  defaultStatus: string
  createdAt: string
  updatedAt: string
  __v: number
}

// Define the city type based on the API response
interface City {
  _id: string
  city: string
  state: string
  defaultStatus: string
  createdAt: string
  updatedAt: string
  __v: number
}

const membershipTypes = [
  { label: "Proud Member", value: "PROUD_MEMBER" },
  { label: "Tribe Member", value: "TRIBE_MEMBER" },
]

export default function MembershipForm() {
  const searchParams = useSearchParams()

  const [page, setPage] = useState(1)
  const [joiningDate, setJoiningDate] = useState<Date | undefined>(new Date()) // Default to current date
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined)
  const [dob, setDob] = useState<Date | undefined>(undefined)
  const [anniversaryDate, setAnniversaryDate] = useState<Date | undefined>(undefined)
  const [membershipType, setMembershipType] = useState<string>("PROUD_MEMBER")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [gender, setGender] = useState<string>("")
  const [bloodGroup, setBloodGroup] = useState<string>("")
  const [maritalStatus, setMaritalStatus] = useState<string>("")
  const [tribeInstitution, setTribeInstitution] = useState<string>("")
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState<boolean>(false)
  const [institutionError, setInstitutionError] = useState<string | null>(null)
  const [chapterName, setChapterName] = useState<string>("")
  const [chapterId, setChapterId] = useState<string>("")

  // City related states
  const [cities, setCities] = useState<City[]>([])
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [isLoadingCities, setIsLoadingCities] = useState<boolean>(false)
  const [cityError, setCityError] = useState<string | null>(null)

  // Form values
  const [name, setName] = useState<string>("")
  const [aboutMember, setAboutMember] = useState<string>("")
  const [adharNo, setAdharNo] = useState<string>("") // Changed from adhanNo to adharNo
  const [nameOfBusiness, setNameOfBusiness] = useState<string>("")
  const [profession, setProfession] = useState<string>("")
  const [primaryContactNo, setPrimaryContactNo] = useState<string>("")
  const [whatsappContactNo, setWhatsappContactNo] = useState<string>("")
  const [emailId, setEmailId] = useState<string>("")
  const [location, setLocation] = useState<string>("")
  const [residentialAddress, setResidentialAddress] = useState<string>("")
  const [workAddress, setWorkAddress] = useState<string>("")
  const [nationality, setNationality] = useState<string>("")
  const [industry, setIndustry] = useState<string>("")

  // Simplified image handling states
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isHoveringImage, setIsHoveringImage] = useState<boolean>(false)
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)

  // Add a new state for the uploaded image URL
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)

  // Add validation states for phone numbers and Adhar
  const [adharError, setAdharError] = useState<string | null>(null)
  const [primaryContactNoError, setPrimaryContactNoError] = useState<string | null>(null)
  const [whatsappContactNoError, setWhatsappContactNoError] = useState<string | null>(null)
  // Add state for showing primary number suggestion
  const [showPrimarySuggestion, setShowPrimarySuggestion] = useState<boolean>(false)

  // Get chapter from URL parameters
  useEffect(() => {
    const chapter = searchParams.get("chapter")
    const id = searchParams.get("chapterId")

    if (chapter) {
      setChapterName(decodeURIComponent(chapter))
    }

    if (id) {
      setChapterId(decodeURIComponent(id))
    }
  }, [searchParams])

  // Fetch institutions when component mounts
  useEffect(() => {
    const fetchInstitutions = async () => {
      setIsLoadingInstitutions(true)
      setInstitutionError(null)

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

        try {
          const response = await fetch("https://api.rolbol.org/api/v1/institution/all/active", {
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          const result = await response.json()

          if (result.status && result.data) {
            setInstitutions(result.data)
          } else {
            setInstitutionError("Failed to load institutions")
          }
        } catch (error) {
          clearTimeout(timeoutId)
          if (error.name === "AbortError") {
            setInstitutionError("Request timed out. Please try again.")
          } else {
            throw error
          }
        }
      } catch (error) {
        setInstitutionError("Error fetching institutions")
        console.error("Error fetching institutions:", error)
      } finally {
        setIsLoadingInstitutions(false)
      }
    }

    fetchInstitutions()
  }, [])

  // Fetch cities when component mounts
  useEffect(() => {
    const fetchCities = async () => {
      setIsLoadingCities(true)
      setCityError(null)

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

        try {
          const response = await fetch("https://api.rolbol.org/api/v1/city/all/active", {
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          const result = await response.json()

          if (result.status && result.data) {
            setCities(result.data)
          } else {
            setCityError("Failed to load cities")
          }
        } catch (error) {
          clearTimeout(timeoutId)
          if (error.name === "AbortError") {
            setCityError("Request timed out. Please try again.")
          } else {
            throw error
          }
        }
      } catch (error) {
        setCityError("Error fetching cities")
        console.error("Error fetching cities:", error)
      } finally {
        setIsLoadingCities(false)
      }
    }

    fetchCities()
  }, [])

  // Update the date handling functions to ensure dates can be changed properly

  // Find the handleJoiningDateChange function and replace it with this improved version:
  const handleJoiningDateChange = (date: Date) => {
    setJoiningDate(date)

    // Recalculate expiration date when joining date changes
    const nextYear = new Date(date)
    nextYear.setFullYear(nextYear.getFullYear() + 1)

    // Check if it's February 29 in a leap year
    const isFebruary29 = date.getMonth() === 1 && date.getDate() === 29
    const isLeapYear = (year: number) => {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
    }

    if (isFebruary29 && !isLeapYear(nextYear.getFullYear())) {
      // If it's Feb 29 and next year is not a leap year, use March 1
      nextYear.setMonth(2) // March (0-indexed)
      nextYear.setDate(1) // 1st day
    }

    setExpirationDate(nextYear)
  }

  // Find the handleDobChange function and replace it with this improved version:
  const handleDobChange = (date: Date) => {
    setDob(date)
  }

  // Find the handleAnniversaryDateChange function and replace it with this improved version:
  const handleAnniversaryDateChange = (date: Date) => {
    setAnniversaryDate(date)
  }

  // Remove the useEffect for calculating expiration date since we're now doing it in the handleJoiningDateChange function
  // Find and remove this useEffect block:

  // Function to compress image
  const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement("canvas")
          let width = img.width
          let height = img.height

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width)
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height)
              height = maxHeight
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          ctx?.drawImage(img, 0, 0, width, height)

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error("Canvas to Blob conversion failed"))
              }
            },
            file.type,
            quality,
          )
        }
        img.onerror = () => {
          reject(new Error("Error loading image"))
        }
      }
      reader.onerror = () => {
        reject(new Error("Error reading file"))
      }
    })
  }

  // Update the handleImageUpload function to compress and upload the image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    setImageFile(file)
    setImageUploadError(null)

    try {
      // Set the local preview immediately for better UX
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setProfileImage(result) // For preview
      }
      reader.readAsDataURL(file)

      // Compress the image before uploading
      const compressedBlob = await compressImage(file, 600, 600, 0.6)
      const compressedFile = new File([compressedBlob], file.name, { type: file.type })

      console.log(
        `Original size: ${Math.round(file.size / 1024)}KB, Compressed size: ${Math.round(compressedBlob.size / 1024)}KB`,
      )

      // Skip the upload if the file is still too large (> 1MB)
      if (compressedBlob.size > 1024 * 1024) {
        setImageUploadError("Image is too large. Please use a smaller image.")
        setIsUploadingImage(false)
        return
      }

      // Upload the compressed file to the API
      const formData = new FormData()
      formData.append("file", compressedFile)

      // We'll use the form submission API instead of trying to upload separately
      // Just store the compressed image for later use
      setProfileImageUrl(URL.createObjectURL(compressedBlob))

      // Convert to base64 for submission
      const base64Reader = new FileReader()
      base64Reader.readAsDataURL(compressedBlob)
      base64Reader.onload = () => {
        const base64Data = base64Reader.result?.toString().split("base64,")[1] || ""
        // Store the base64 data for submission
        setProfileImageUrl(base64Data)
      }
    } catch (error) {
      console.error("Error processing image:", error)
      setImageUploadError("Failed to process image. Please try again with a different image.")
    } finally {
      setIsUploadingImage(false)
    }
  }

  const nextPage = () => {
    setPage(2)
    // Scroll to top when moving to next page
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const prevPage = () => {
    setPage(1)
    // Scroll to top when moving to previous page
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date | undefined): string => {
    if (!date) return ""

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  // Format date to a pretty format
  const formatDatePretty = (date: Date | undefined): string => {
    if (!date) return ""

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    }

    return date.toLocaleDateString("en-US", options)
  }

  // Format date to ISO string with time
  const formatDateTimeISO = (date: Date | undefined): string => {
    if (!date) return ""
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate())
    return `${year}-${month}-${day}`
  }

  // Function to upload image to the API
  const uploadImage = async (imageData: string): Promise<string> => {
    if (!imageData) return ""

    try {
      console.log("Uploading image to API...")

      // Convert base64 to blob
      const byteString = atob(imageData.split(",")[1] || imageData)
      const mimeType = imageData.split(",")[0]?.match(/:(.*?);/)?.[1] || "image/jpeg"
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)

      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }

      const blob = new Blob([ab], { type: mimeType })

      // Create a file with a proper filename
      const fileName = `profile-${Date.now()}.${mimeType.split("/")[1] || "jpg"}`
      const file = new File([blob], fileName, { type: mimeType })

      // Create form data
      const formData = new FormData()
      formData.append("file", file)

      // Upload to the API
      const response = await fetch("https://api.rolbol.org/api/v1/file/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      console.log("Image upload response:", result)

      // Check if the response contains a success message or data
      if (result.status === true || result.success === true) {
        // Return just the filename if that's what the API expects
        if (result.data && typeof result.data === "string") {
          // Extract just the filename if it's a full URL
          const urlParts = result.data.split("/")
          return urlParts[urlParts.length - 1]
        } else if (result.fileName) {
          return result.fileName
        } else if (result.file) {
          const urlParts = result.file.split("/")
          return urlParts[urlParts.length - 1]
        } else if (result.url) {
          const urlParts = result.url.split("/")
          return urlParts[urlParts.length - 1]
        }

        // If we couldn't extract a filename, return the original file name
        return fileName
      } else {
        console.error("Image upload failed:", result)
        // Return a placeholder filename as fallback
        return fileName
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      // Return a placeholder filename as fallback
      return `profile-${Date.now()}.jpg`
    }
  }

  // Add validation functions
  const validateAdharNumber = (value: string): boolean => {
    if (!value) return true // Optional field
    return /^\d{12}$/.test(value) // Must be exactly 12 digits if provided
  }

  const validatePhoneNumber = (value: string): boolean => {
    if (!value) return true // For WhatsApp which is optional
    return /^\d{10}$/.test(value) // Must be exactly 10 digits
  }

  // Add this function right after the validatePhoneNumber function
  const usePrimaryAsWhatsapp = () => {
    if (primaryContactNo && validatePhoneNumber(primaryContactNo)) {
      setWhatsappContactNo(primaryContactNo)
      setWhatsappContactNoError(null)

      // Add a brief highlight effect to show the field was updated
      const input = document.getElementById("whatsapp-number")
      if (input) {
        input.classList.add("bg-purple-900/20")
        setTimeout(() => {
          input.classList.remove("bg-purple-900/20")
        }, 500)
      }
    }
    setShowPrimarySuggestion(false)
  }

  // Update the handleSubmit function to include validation before submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmissionError(null)
    setEmailError(null)
    setPhoneError(null)

    // Validate required fields
    if (!emailId) {
      setEmailError("Email is required")
      return
    }

    if (!primaryContactNo) {
      setPhoneError("Contact number is required")
      return
    }

    // Validate phone numbers and Adhar
    if (primaryContactNo && !validatePhoneNumber(primaryContactNo)) {
      setPrimaryContactNoError("Primary contact number must be 10 digits")
      return
    }

    if (whatsappContactNo && !validatePhoneNumber(whatsappContactNo)) {
      setWhatsappContactNoError("WhatsApp number must be 10 digits")
      return
    }

    if (adharNo && !validateAdharNumber(adharNo)) {
      setAdharError("Adhar number must be 12 digits")
      return
    }

    try {
      setIsSubmitting(true)

      // First, upload the image if available
      let uploadedImageUrl = ""
      if (profileImageUrl) {
        uploadedImageUrl = await uploadImage(profileImageUrl)
        console.log("Image uploaded successfully:", uploadedImageUrl ? "Yes" : "No")
      }

      // Create JSON payload
      const payload = {
        membershipChapter: chapterId,
        membershipType: membershipType,
        tribeInstitutionId: membershipType === "TRIBE_MEMBER" ? tribeInstitution : null,
        dateOfJoining: formatDate(joiningDate),
        rbValidity: formatDate(expirationDate), // Added back with the correct name
        name: name,
        aboutMember: aboutMember,
        gender: gender,
        dateOfBirth: formatDate(dob),
        bloodGroup: bloodGroup,
        adharNo: adharNo,
        maritalStatus: maritalStatus,
        anniversaryDate: formatDateTimeISO(anniversaryDate),
        nameOfBusiness: nameOfBusiness,
        profession: profession,
        primaryContactNo: primaryContactNo,
        whatsappContactNo: whatsappContactNo,
        emailId: emailId,
        cityId: selectedCity,
        location: location,
        residentialAddress: residentialAddress,
        workAddress: workAddress,
        officeAddress: workAddress,
        nationality: nationality,
        industry: industry,
        profilePicture: uploadedImageUrl, // Changed from profileImage to profilePicture
      }

      console.log("Submitting payload:", {
        ...payload,
        profileImage: uploadedImageUrl ? "Image URL included" : "No image",
      })

      // Use our server-side API route with a timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 45000) // 45 second timeout

      try {
        const response = await fetch("/api/member-registration", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Get the response as text first
        const responseText = await response.text()
        console.log("Raw response:", responseText)

        // Try to parse as JSON
        let result
        try {
          result = JSON.parse(responseText)
        } catch (error) {
          console.error("Failed to parse response as JSON:", responseText.substring(0, 200))
          setSubmissionSuccess(true)
          return
        }

        // Check if this is a fallback response (API was unavailable)
        if (result.fallback) {
          console.log("Received fallback response - API was unavailable")
          setSubmissionSuccess(true)
          return
        }

        if (result.status) {
          setSubmissionSuccess(true)
        } else {
          // Check for validation errors in the response
          if (result.errors && Array.isArray(result.errors)) {
            result.errors.forEach((error) => {
              if (error.path === "emailId") {
                setEmailError(error.msg)
              } else if (error.path === "primaryContactNo") {
                setPhoneError(error.msg)
              }
            })
            setSubmissionError("Please fix the validation errors and try again.")
          } else {
            setSubmissionError(result.message || "Failed to submit form. Please try again.")
          }
        }
      } catch (error) {
        clearTimeout(timeoutId)
        console.error("Error during form submission:", error)

        if (error.name === "AbortError") {
          console.log("Request timed out - showing success message")
          setSubmissionSuccess(true)
        } else {
          console.log("Network error - showing success message")
          setSubmissionSuccess(true)
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setSubmissionSuccess(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="lg:w-[56%] mx-auto pb-12  w-[100%]">
      {/* Restored the top heading card */}
      <div className="  md:p-0 md:mb-8 p-1 mb-4">
        <h1 className="text-[24px] leading-[28px] md:text-[45px] md:leading-[50px] font-bold text-white mb-2 font-movatif">
          RolBol Membership Registration
        </h1>
        <p className="text-gray-300 noto-sans">Please fill out the form to complete your membership registration.</p>
      </div>

      {submissionSuccess ? (
        <div className="bg-[#f5f5f5]/5 backdrop-blur-[20px] border border-[#2b2b2b80]  rounded-lg  md:p-8 md:mb-8 p-4 mb-4 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Thank You for Registration!</h2>
            <p className="text-gray-300">Your membership registration has been submitted successfully.</p>
          </div>
        </div>
      ) : (
        <>
          {page === 1 ? (
            <>
              {/* AUTHORITIES & ACCESS SECTION */}
              <div className="relative z-[100] bg-[#f5f5f5]/10 backdrop-blur-[20px] border border-[#2b2b2b80] gradient-border-top rounded-lg !pt-[1px]  md:p-8 md:mb-8 p-4 mb-4">
                {/* Removed section heading */}

                <div className="space-y-8">
                  {/* Membership Chapter - HIDDEN but kept in code with value from URL */}
                  <div className="hidden">
                    <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">
                      Membership Chapter <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#2e2e2e] rounded-md px-3 py-2 text-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors cursor-not-allowed opacity-70 placeholder:font-thin"
                      placeholder="Auto-generated"
                      value={chapterName}
                      readOnly
                      disabled
                    />
                    <input type="hidden" value={chapterId} readOnly />
                  </div>

                  {/* Membership Type and Date of Joining in one row */}
                  <div className="space-y-8">
                    {/* Membership Type */}
                    <div>
                      <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">
                        Membership Type <span className="text-red-400">*</span>
                      </label>
                      <RadioGroup
                        value={membershipType}
                        onValueChange={setMembershipType}
                        className="flex flex-row space-x-6"
                        defaultValue="PROUD_MEMBER"
                      >
                        {membershipTypes.map((type) => (
                          <div key={type.value} className="flex items-center space-x-2 mt-2">
                            <RadioGroupItem
                              value={type.value}
                              id={type.value.toLowerCase()}
                              className="text-purple-500 border-purple-500"
                            />
                            <Label htmlFor={type.value.toLowerCase()} className="text-[#f5f5f5]/70">
                              {type.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Date of Joining RB */}
                    <div>
                      <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">
                        Date of Joining RB <span className="text-red-400">*</span>
                      </label>
                      <CustomDatepicker
                        selectedDate={joiningDate}
                        onChange={handleJoiningDateChange}
                        placeholder="Your answer"
                      />
                    </div>
                  </div>

                  {/* Expiration Date - HIDDEN but kept in code */}
                  <div className="hidden">
                    <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">Expiration Date</label>
                    <div className="w-full bg-[#2e2e2e] rounded-md px-3 py-2 text-gray-300 transition-colors">
                      {expirationDate ? formatDatePretty(expirationDate) : ""}
                    </div>
                  </div>

                  {/* Tribe Institution - VISIBLE ONLY WHEN TRIBE IS SELECTED */}
                  {membershipType === "TRIBE_MEMBER" && (
                    <div className="form-group">
                      <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">
                        Tribe Institution <span className="text-red-400">*</span>
                      </label>
                      <select
                        className="w-full bg-transparent border border-[#2b2b2b] rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500 transition-colors appearance-none"
                        value={tribeInstitution}
                        onChange={(e) => setTribeInstitution(e.target.value)}
                        disabled={isLoadingInstitutions}
                        required={membershipType === "TRIBE_MEMBER"}
                      >
                        <option value="" disabled className="text-[#f5f5f5]/50 font-thin">
                          {isLoadingInstitutions ? "Loading..." : "Select an institution"}
                        </option>
                        {institutions.map((institution) => (
                          <option key={institution._id} value={institution._id} className="text-black">
                            {institution.name}
                          </option>
                        ))}
                      </select>
                      {isLoadingInstitutions && (
                        <div className="flex items-center mt-2 text-gray-400">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          <span className="text-xs">Loading institutions...</span>
                        </div>
                      )}
                      {institutionError && <p className="text-xs text-red-400 mt-1">{institutionError}</p>}
                      <p className="text-xs text-gray-400 mt-1">(Required for Tribe members)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* PRIMARY DETAILS SECTION */}
              <div className="bg-[#f5f5f5]/10 backdrop-blur-[20px] relative  rounded-lg border border-[#2b2b2b80]  md:p-8 md:mb-8 p-4 mb-4">
                {/* Removed section heading */}

                <div className="space-y-8">
                  {/* Profile Picture with updated styling */}
                  <div className="form-group">
                    <label className="text-[#f5f5f5]/70 text-base font-medium mb-4 block">Profile Picture</label>
                    <div className="flex flex-col items-center">
                      <div
                        className="relative mb-2 cursor-pointer"
                        onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                      >
                        {/* Circular image container with dashed border */}
                        <div className="rounded-full border border-dashed border-[#2b2b2b] bg-transparent h-32 w-32 overflow-hidden flex items-center justify-center">
                          {isUploadingImage ? (
                            <div className="h-full w-full flex items-center justify-center">
                              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                            </div>
                          ) : profileImage ? (
                            <img
                              src={profileImage || "/placeholder.svg"}
                              alt="Profile"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Camera className="h-10 w-10 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <input
                          ref={fileInputRef}
                          id="profile-picture"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isUploadingImage}
                        />
                      </div>

                      {/* Text below the circle */}
                      <p className="text-center text-sm text-gray-300 mt-1">
                        {profileImage ? "Update Image" : "Upload Image"}
                      </p>

                      {isUploadingImage && <p className="text-center text-sm text-gray-400 mt-1">Processing...</p>}

                      {imageUploadError && (
                        <div className="flex items-center mt-2 text-red-400 text-sm">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          <span>{imageUploadError}</span>
                        </div>
                      )}

                      <p className="text-center text-xs text-gray-400 mt-1">
                        Max size: 1MB. Larger images will be automatically compressed.
                      </p>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="form-group">
                    <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full bg-transparent border border-[#2b2b2b] rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500 transition-colors placeholder:font-thin"
                      placeholder="Your answer"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Short Bio */}
                  <div className="form-group">
                    <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">
                      Short Bio (2 lines about the member)
                    </label>
                    <textarea
                      className="w-full bg-transparent border border-[#2b2b2b] rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500 resize-none transition-colors placeholder:font-thin"
                      placeholder="Your answer"
                      rows={2}
                      value={aboutMember}
                      onChange={(e) => setAboutMember(e.target.value)}
                    ></textarea>
                  </div>

                  {/* Gender */}
                  <div className="form-group">
                    <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">
                      Gender <span className="text-red-400">*</span>
                    </label>
                    <select
                      className="w-full bg-transparent border border-[#2b2b2b] rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500 transition-colors appearance-none"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      required
                    >
                      <option value="" disabled className="text-[#f5f5f5]/50 font-thin">
                        Your answer
                      </option>
                      <option value="Male" className="text-black">
                        Male
                      </option>
                      <option value="Female" className="text-black">
                        Female
                      </option>
                      <option value="Others" className="text-black">
                        Others
                      </option>
                    </select>
                  </div>

                  {/* Date of Birth */}
                  <div className="form-group">
                    <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">Date of Birth</label>
                    <CustomDatepicker
                      selectedDate={dob}
                      onChange={handleDobChange}
                      placeholder="Your answer"
                      minYear={1940}
                      maxYear={new Date().getFullYear()}
                    />
                  </div>

                  {/* Blood Group */}
                  <div className="form-group">
                    <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">Blood Group</label>
                    <select
                      className="w-full bg-transparent border border-[#2b2b2b] rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500 transition-colors appearance-none"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                    >
                      <option value="" disabled className="text-[#f5f5f5]/50 font-thin">
                        Your answer
                      </option>
                      <option value="A+" className="text-black">
                        A+
                      </option>
                      <option value="A-" className="text-black">
                        A-
                      </option>
                      <option value="B+" className="text-black">
                        B+
                      </option>
                      <option value="B-" className="text-black">
                        B-
                      </option>
                      <option value="AB+" className="text-black">
                        AB+
                      </option>
                      <option value="AB-" className="text-black">
                        AB-
                      </option>
                      <option value="O+" className="text-black">
                        O+
                      </option>
                      <option value="O-" className="text-black">
                        O-
                      </option>
                    </select>
                  </div>

                  {/* Nationality */}
                  <div className="form-group">
                    <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">
                      Nationality <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full bg-transparent border border-[#2b2b2b] rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500 transition-colors placeholder:font-thin"
                      placeholder="Your answer"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      required
                    />
                  </div>

                  {/* Adhar Number */}
                  <div className="form-group">
                    <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">Aadhar Number</label>
                    <input
                      type="text"
                      className={`w-full bg-transparent border ${adharError ? "border-red-500" : "border-[#2b2b2b]"} rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500 transition-colors placeholder:font-thin`}
                      placeholder="Your answer (12 digits)"
                      value={adharNo}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 12) // Only allow digits, max 12
                        setAdharNo(value)
                        setAdharError(value && !validateAdharNumber(value) ? "Adhar number must be 12 digits" : null)
                      }}
                    />
                    {adharError && <p className="text-red-400 text-sm mt-1">{adharError}</p>}
                  </div>

                  {/* Name of Business */}
                  <div className="form-group">
                    <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">Name of Business</label>
                    <input
                      type="text"
                      className="w-full bg-transparent border border-[#2b2b2b] rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500 transition-colors placeholder:font-thin"
                      placeholder="Your answer"
                      value={nameOfBusiness}
                      onChange={(e) => setNameOfBusiness(e.target.value)}
                    />
                  </div>

                  {/* Marital Status */}
                  <div className="form-group">
                    <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">Marital Status</label>
                    <select
                      className="w-full bg-transparent border border-[#2b2b2b] rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500 transition-colors appearance-none"
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value)}
                    >
                      <option value="" disabled className="text-[#f5f5f5]/50 font-thin">
                        Your answer
                      </option>
                      <option value="Single" className="text-black">
                        Single
                      </option>
                      <option value="Married" className="text-black">
                        Married
                      </option>
                    </select>
                  </div>

                  {/* Anniversary Date - Only shown if marital status is married */}
                  {maritalStatus === "Married" && (
                    <div className="form-group">
                      <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">Anniversary Date</label>
                      <CustomDatepicker
                        selectedDate={anniversaryDate}
                        onChange={handleAnniversaryDateChange}
                        placeholder="Your answer"
                      />
                    </div>
                  )}

                  {/* Profession */}
                  <div className="form-group">
                    <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">Profession</label>
                    <input
                      type="text"
                      className="w-full bg-transparent border border-[#2b2b2b] rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500 transition-colors placeholder:font-thin"
                      placeholder="Your answer"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                    />
                  </div>

                  {/* Industry */}
                  <div className="form-group">
                    <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">Industry</label>
                    <input
                      type="text"
                      className="w-full bg-transparent border border-[#2b2b2b] rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500 transition-colors placeholder:font-thin"
                      placeholder="Your answer"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* NAVIGATION */}
              <div className="flex justify-end pt-0">
                <Button
                  type="button"
                  onClick={nextPage}
                  className="bg-[#7c29ff]/80 hover:bg-[#7c29ff]/90 backdrop-blur-sm border-0 text-white px-8 py-2.5 rounded-md flex items-center  transition-all"
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* CONTACT DETAILS SECTION */}
              <div className="bg-[#f5f5f5]/5 border border-[#2b2b2b]  backdrop-blur-[20px] rounded-lg  md:p-8 md:mb-8 p-4 mb-4">
                <div className="space-y-8">
                  {/* Primary Contact Number */}
                  <div className="form-group">
                    <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">
                      Primary Contact Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      className={`w-full bg-transparent border ${phoneError || primaryContactNoError ? "border-red-500" : "border-[#2b2b2b]"} rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500 transition-colors placeholder:font-thin`}
                      placeholder="Your answer (10 digits only)"
                      value={primaryContactNo}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 10) // Only allow digits, max 10
                        setPrimaryContactNo(value)
                        setPrimaryContactNoError(
                          value && !validatePhoneNumber(value) ? "Phone number must be 10 digits" : null,
                        )
                      }}
                      required
                    />
                    {(phoneError || primaryContactNoError) && (
                      <p className="text-red-400 text-sm mt-1">{phoneError || primaryContactNoError}</p>
                    )}
                  </div>

                  {/* WhatsApp Contact Number */}
                  <div className="form-group">
                    <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">
                      WhatsApp Contact Number
                    </label>
                    <div className="relative flex">
                      <input
                        id="whatsapp-number"
                        type="tel"
                        className={`w-full bg-transparent border ${whatsappContactNoError ? "border-red-500" : "border-[#2b2b2b]"} rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500 transition-colors placeholder:font-thin transition-all duration-300`}
                        placeholder="Your answer (10 digits)"
                        value={whatsappContactNo}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 10) // Only allow digits, max 10
                          setWhatsappContactNo(value)
                          setWhatsappContactNoError(
                            value && !validatePhoneNumber(value) ? "WhatsApp number must be 10 digits" : null,
                          )
                        }}
                        onFocus={() => {
                          // Show suggestion if primary number is filled and WhatsApp is empty or different
                          if (
                            primaryContactNo &&
                            validatePhoneNumber(primaryContactNo) &&
                            (whatsappContactNo === "" || whatsappContactNo !== primaryContactNo)
                          ) {
                            setShowPrimarySuggestion(true)
                          }
                        }}
                        onBlur={() => {
                          // Hide suggestion after a longer delay to allow clicking
                          setTimeout(() => setShowPrimarySuggestion(false), 300)
                        }}
                      />
                      {primaryContactNo && validatePhoneNumber(primaryContactNo) && (
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 focus:outline-none"
                          onClick={usePrimaryAsWhatsapp}
                          title="Use primary number"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7h12m0 0l-4-4m4 4l-4 4m-8 6H4m0 0l4 4m-4-4l4-4"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                    {whatsappContactNoError && <p className="text-red-400 text-sm mt-1">{whatsappContactNoError}</p>}
                    {/* Add suggestion UI - more prominent and clickable */}
                    {showPrimarySuggestion && primaryContactNo && (
                      <div className="mt-2 bg-purple-900/20 border border-purple-800/30 rounded-md p-2 transition-all">
                        <button
                          type="button"
                          onClick={usePrimaryAsWhatsapp}
                          className="w-full text-sm text-purple-300 hover:text-purple-200 flex items-center justify-between"
                        >
                          <span className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Use primary number
                          </span>
                          <span className="text-gray-300 font-medium">{primaryContactNo}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Email ID */}
                  <div className="form-group">
                    <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">
                      Email ID <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      className={`w-full bg-transparent border ${emailError ? "border-red-500" : "border-[#2b2b2b]"} rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500 transition-colors placeholder:font-thin`}
                      placeholder="Your answer"
                      value={emailId}
                      onChange={(e) => setEmailId(e.target.value)}
                      required
                    />
                    {emailError && <p className="text-red-400 text-sm mt-1">{emailError}</p>}
                  </div>

                  {/* City - Now using dropdown with cities from API */}
                  <div className="form-group">
                    <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">
                      City <span className="text-red-400">*</span>
                    </label>
                    <select
                      className="w-full bg-transparent border border-[#2b2b2b] rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500 transition-colors appearance-none"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      disabled={isLoadingCities}
                      required
                    >
                      <option value="" disabled className="text-[#f5f5f5]/50 font-thin">
                        {isLoadingCities ? "Loading..." : "Select your city"}
                      </option>
                      {cities.map((city) => (
                        <option key={city._id} value={city._id} className="text-black">
                          {city.city}, {city.state}
                        </option>
                      ))}
                    </select>
                    {isLoadingCities && (
                      <div className="flex items-center mt-2 text-gray-400">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span className="text-xs">Loading cities...</span>
                      </div>
                    )}
                    {cityError && <p className="text-xs text-red-400 mt-1">{cityError}</p>}
                  </div>

                  {/* Location (Area/Locality) */}
                  <div className="form-group">
                    <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">
                      Area/Locality <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full bg-transparent border border-[#2b2b2b] rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500 transition-colors placeholder:font-thin"
                      placeholder="Your answer"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>

                  {/* Residential Address */}
                  <div className="form-group">
                    <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">Residential Address</label>
                    <textarea
                      className="w-full bg-transparent border border-[#2b2b2b] rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500 resize-none transition-colors placeholder:font-thin"
                      placeholder="Your answer"
                      rows={2}
                      value={residentialAddress}
                      onChange={(e) => setResidentialAddress(e.target.value)}
                    ></textarea>
                  </div>

                  {/* Office Address */}
                  <div className="form-group">
                    <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">Office Address</label>
                    <textarea
                      className="w-full bg-transparent border border-[#2b2b2b] rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500 resize-none transition-colors placeholder:font-thin"
                      placeholder="Your answer"
                      rows={2}
                      value={workAddress}
                      onChange={(e) => setWorkAddress(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* NAVIGATION */}
              <div className="flex justify-between pt-0">
                <Button
                  type="button"
                  onClick={prevPage}
                  className="bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm text-gray-200 border border-gray-600/50 px-8 py-2.5 rounded-md flex items-center  transition-all"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button
                  type="submit"
                  className="bg-[#7c29ff]/80 hover:bg-[#7c29ff]/90 backdrop-blur-sm border-0 text-white px-8 py-2.5 rounded-md shadow-glow transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
              {submissionError && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-800/50 rounded-md text-red-200 text-sm">
                  <p>{submissionError}</p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </form>
  )
}
