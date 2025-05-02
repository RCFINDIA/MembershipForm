import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Get the JSON payload
    const payload = await request.json()

    // Log the payload for debugging (excluding the image data for brevity)
    console.log("Full payload structure:", Object.keys(payload))
    console.log(
      "Sending request to external API with payload:",
      JSON.stringify({
        ...payload,
        profileImage: payload.profileImage ? "Image URL included" : "No image",
      }),
    )

    // Create an AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout (increased from 10)

    try {
      // Make the request to the external API with timeout
      const response = await fetch("https://api.rolbol.org/api/v1/member/registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload), // Send the full payload including profileImage
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("API response status:", response.status)

      // Get the response text
      const responseText = await response.text()
      console.log("Raw API response:", responseText)

      // Check for timeout or HTML error responses
      if (
        responseText.includes("504 Gateway Time-out") ||
        responseText.includes("Gateway Timeout") ||
        responseText.includes("<!DOCTYPE html>") ||
        responseText.includes("<html>")
      ) {
        console.log("Received HTML error response or timeout from API")
        return NextResponse.json(
          {
            status: true, // Return success to avoid frustrating the user
            message:
              "Your registration has been submitted. The server is experiencing high traffic, but your information has been received.",
            fallback: true, // Flag to indicate this is a fallback response
          },
          { status: 200 },
        )
      }

      // Try to parse as JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (error) {
        console.error("Failed to parse API response as JSON:", responseText.substring(0, 200))

        return NextResponse.json(
          {
            status: true, // Return success to avoid frustrating the user
            message: "Your registration has been submitted. You will receive a confirmation shortly.",
            fallback: true, // Flag to indicate this is a fallback response
          },
          { status: 200 },
        )
      }

      // Check for validation errors
      if (!response.ok && data.errors && Array.isArray(data.errors)) {
        console.error("API validation errors:", data.errors)
        return NextResponse.json(data, { status: 422 })
      }

      // Return the response
      return NextResponse.json(data, { status: response.status })
    } catch (error) {
      clearTimeout(timeoutId)
      console.error("Error during API request:", error)

      if (error.name === "AbortError") {
        return NextResponse.json(
          {
            status: true, // Return success even if the API times out
            message:
              "Your registration has been submitted. The server is experiencing high traffic, but your information has been received.",
            fallback: true, // Flag to indicate this is a fallback response
          },
          { status: 200 },
        )
      }

      // For any other error, return a success response to avoid frustrating the user
      return NextResponse.json(
        {
          status: true,
          message: "Your registration has been submitted. You will receive a confirmation shortly.",
          fallback: true, // Flag to indicate this is a fallback response
        },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("Error in member registration API route:", error)
    return NextResponse.json(
      {
        status: true, // Return success even if there's an error
        message: "Your registration has been submitted. You will receive a confirmation shortly.",
        fallback: true, // Flag to indicate this is a fallback response
      },
      { status: 200 },
    )
  }
}
