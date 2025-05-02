"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"

import { cn } from "@/lib/utils"
import { Calendar } from "lucide-react"

interface CustomDatepickerProps {
  selectedDate: Date | undefined
  onChange: (date: Date) => void
  label?: string
  placeholder?: string
  className?: string
  minYear?: number
  maxYear?: number
}

export default function CustomDatepicker({
  selectedDate,
  onChange,
  label,
  placeholder = "Select date",
  className,
  minYear = 1950,
  maxYear = new Date().getFullYear() + 10,
}: CustomDatepickerProps) {
  // State for selected values
  const [day, setDay] = useState<string>(selectedDate ? String(selectedDate.getDate()).padStart(2, "0") : "")
  const [month, setMonth] = useState<string>(selectedDate ? String(selectedDate.getMonth() + 1).padStart(2, "0") : "")
  const [year, setYear] = useState<string>(selectedDate ? String(selectedDate.getFullYear()) : "")
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false)
  const [inputType, setInputType] = useState<"day" | "month" | "year" | null>(null)

  // Flag to prevent infinite update loops
  const isInternalUpdate = useRef(false)

  const calendarRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Format date for display
  const formatDate = (day: string, month: string, year: string) => {
    if (!day && !month && !year) return ""
    return `${day || "DD"}-${month || "MM"}-${year || "YYYY"}`
  }

  // Compare dates to check if they're the same
  const areDatesEqual = (date1: Date | undefined, date2: Date | undefined) => {
    if (!date1 || !date2) return date1 === date2
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  // Update parent component when all date parts are entered
  useEffect(() => {
    // Skip if this is triggered by an external update
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }

    if (day && month && year && day.length === 2 && month.length === 2 && year.length === 4) {
      const newDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))

      // Only update if the date is valid and different from the current selectedDate
      if (!isNaN(newDate.getTime()) && !areDatesEqual(newDate, selectedDate)) {
        onChange(newDate)
      }
    }
  }, [day, month, year, onChange, selectedDate])

  // Sync with parent's selectedDate when it changes externally
  useEffect(() => {
    if (selectedDate) {
      const newDay = String(selectedDate.getDate()).padStart(2, "0")
      const newMonth = String(selectedDate.getMonth() + 1).padStart(2, "0")
      const newYear = String(selectedDate.getFullYear())

      // Only update if values are different to prevent loops
      if (newDay !== day || newMonth !== month || newYear !== year) {
        isInternalUpdate.current = true
        setDay(newDay)
        setMonth(newMonth)
        setYear(newYear)
      }
    }
  }, [selectedDate, day, month, year])

  // Handle click outside to close calendar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setIsCalendarOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle input changes
  const handleInputChange = (value: string, type: "day" | "month" | "year") => {
    if (!value) {
      if (type === "day") setDay("")
      else if (type === "month") setMonth("")
      else setYear("")
      return
    }

    const numericValue = value.replace(/\D/g, "")

    if (type === "day") {
      if (numericValue.length <= 2) {
        let validDay = numericValue
        if (numericValue.length > 0) {
          const numDay = Number.parseInt(numericValue)
          if (numDay > 31) validDay = "31"
          if (numDay === 0 && numericValue.length === 1) validDay = "0"
          else if (numDay === 0 && numericValue.length === 2) validDay = "01"
        }

        setDay(validDay)

        // Auto-advance to month if two digits entered
        if (validDay.length === 2) {
          setInputType("month")
          setTimeout(() => inputRef.current?.focus(), 10)
        }
      }
    } else if (type === "month") {
      if (numericValue.length <= 2) {
        let validMonth = numericValue
        if (numericValue.length > 0) {
          const numMonth = Number.parseInt(numericValue)
          if (numMonth > 12) validMonth = "12"
          if (numMonth === 0 && numericValue.length === 1) validMonth = "0"
          else if (numMonth === 0 && numericValue.length === 2) validMonth = "01"
        }

        setMonth(validMonth)

        // Auto-advance to year if two digits entered
        if (validMonth.length === 2) {
          setInputType("year")
          setTimeout(() => inputRef.current?.focus(), 10)
        }
      }
    } else if (type === "year") {
      if (numericValue.length <= 4) {
        setYear(numericValue)
      }
    }
  }

  // Add a keydown handler to handle backspace between fields
  const handleKeyDown = (e: React.KeyboardEvent, type: "day" | "month" | "year") => {
    // Handle backspace when field is empty to move to previous field
    if (e.key === "Backspace") {
      if (type === "month" && !month) {
        setInputType("day")
        setTimeout(() => inputRef.current?.focus(), 10)
      } else if (type === "year" && !year) {
        setInputType("month")
        setTimeout(() => inputRef.current?.focus(), 10)
      }
    }
  }

  // Handle date selection from calendar
  const handleDateSelect = (date: Date) => {
    isInternalUpdate.current = true
    setDay(String(date.getDate()).padStart(2, "0"))
    setMonth(String(date.getMonth() + 1).padStart(2, "0"))
    setYear(String(date.getFullYear()))
    setIsCalendarOpen(false)
    onChange(date)
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const currentYear = year ? Number.parseInt(year) : new Date().getFullYear()
    const currentMonth = month ? Number.parseInt(month) - 1 : new Date().getMonth()

    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)

    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay() // 0 = Sunday, 1 = Monday, etc.

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>)
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = day === String(i).padStart(2, "0")
      days.push(
        <div
          key={i}
          className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer text-sm
                     ${isSelected ? "bg-[#7c29ff] text-white" : "hover:bg-gray-700 text-gray-200"}`}
          onClick={() => {
            const newDate = new Date(currentYear, currentMonth, i)
            handleDateSelect(newDate)
          }}
        >
          {i}
        </div>,
      )
    }

    return days
  }

  return (
    <div className={cn("relative", className)}>
      {label && <label className="text-[#f5f5f5]/70 text-base font-medium mb-2 block">{label}</label>}

      {/* Date input field with calendar icon */}
      <div className="relative flex items-center">
        <div className="relative flex-grow bg-transparent border border-[#2b2b2b] rounded-md focus-within:border-purple-500 transition-colors">
          {/* Always show the editable fields */}
          <div className="flex items-center px-3 py-2">
            {/* Day input */}
            {inputType === "day" ? (
              <input
                ref={inputRef}
                type="text"
                value={day}
                onChange={(e) => handleInputChange(e.target.value, "day")}
                onKeyDown={(e) => handleKeyDown(e, "day")}
                className="w-6 bg-transparent text-gray-200 focus:outline-none text-center placeholder:font-thin"
                placeholder="DD"
                maxLength={2}
                autoFocus
              />
            ) : (
              <span
                className="text-gray-200 w-6 text-center cursor-text"
                onClick={() => {
                  setInputType("day")
                  setTimeout(() => inputRef.current?.focus(), 10)
                }}
              >
                {day || "DD"}
              </span>
            )}

            <span className="text-gray-500 mx-1">-</span>

            {/* Month input */}
            {inputType === "month" ? (
              <input
                ref={inputRef}
                type="text"
                value={month}
                onChange={(e) => handleInputChange(e.target.value, "month")}
                onKeyDown={(e) => handleKeyDown(e, "month")}
                className="w-6 bg-transparent text-gray-200 focus:outline-none text-center placeholder:font-thin"
                placeholder="MM"
                maxLength={2}
                autoFocus
              />
            ) : (
              <span
                className="text-gray-200 w-6 text-center cursor-text"
                onClick={() => {
                  setInputType("month")
                  setTimeout(() => inputRef.current?.focus(), 10)
                }}
              >
                {month || "MM"}
              </span>
            )}

            <span className="text-gray-500 mx-1">-</span>

            {/* Year input */}
            {inputType === "year" ? (
              <input
                ref={inputRef}
                type="text"
                value={year}
                onChange={(e) => handleInputChange(e.target.value, "year")}
                onKeyDown={(e) => handleKeyDown(e, "year")}
                className="w-12 bg-transparent text-gray-200 focus:outline-none text-center placeholder:font-thin"
                placeholder="YYYY"
                maxLength={4}
                autoFocus
              />
            ) : (
              <span
                className="text-gray-200 w-12 text-center cursor-text"
                onClick={() => {
                  setInputType("year")
                  setTimeout(() => inputRef.current?.focus(), 10)
                }}
              >
                {year || "YYYY"}
              </span>
            )}
          </div>
        </div>

        {/* Calendar icon button */}
        <button
          type="button"
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className="absolute right-3  transform  text-gray-400 hover:text-gray-200 focus:outline-none"
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar popup */}
      {isCalendarOpen && (
        <div
          ref={calendarRef}
          className="absolute z-50 mt-2 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-lg p-3 w-[280px] max-h-[350px] overflow-y-auto custom-scrollbar"
        >
          {/* Calendar header */}
          <div className="flex items-center justify-between mb-4">
            <select
              value={month}
              onChange={(e) => {
                isInternalUpdate.current = true
                setMonth(e.target.value.padStart(2, "0"))
              }}
              className="bg-[#2a2a2a] text-white border border-gray-600 rounded px-2 py-1 text-sm"
            >
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>

            <select
              value={year}
              onChange={(e) => {
                isInternalUpdate.current = true
                setYear(e.target.value)
              }}
              className="bg-[#2a2a2a] text-white border border-gray-600 rounded px-2 py-1 text-sm"
            >
              {Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="text-center text-xs text-gray-400 font-medium">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">{generateCalendarDays()}</div>
        </div>
      )}
    </div>
  )
}
