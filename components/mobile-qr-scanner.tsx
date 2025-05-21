"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, RefreshCw } from "lucide-react"

interface MobileQrScannerProps {
  onScan: (data: string) => void
}

export function MobileQrScanner({ onScan }: MobileQrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [hasCamera, setHasCamera] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const scanIntervalRef = useRef<number | null>(null)

  // Start the camera
  const startCamera = async () => {
    try {
      setErrorMessage("")
      const constraints = {
        video: { facingMode: "environment" },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsScanning(true)
        setHasCamera(true)
        startScanning()
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setHasCamera(false)
      setErrorMessage("Unable to access camera. Please check permissions.")
    }
  }

  // Stop the camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()

      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }

    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    setIsScanning(false)
  }

  // Start scanning for QR codes
  const startScanning = () => {
    if (!window.jsQR) {
      setErrorMessage("QR scanner library not loaded")
      return
    }

    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current)
    }

    scanIntervalRef.current = window.setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current

        if (video.readyState !== video.HAVE_ENOUGH_DATA) {
          return
        }

        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")

        if (!ctx) return

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        })

        if (code) {
          // QR code found
          stopCamera()
          onScan(code.data)
        }
      }
    }, 100)
  }

  // Initialize camera on component mount
  useEffect(() => {
    // Load jsQR library if not already loaded
    if (!window.jsQR) {
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js"
      script.async = true
      script.onload = () => {
        startCamera()
      }
      document.body.appendChild(script)

      return () => {
        document.body.removeChild(script)
      }
    } else {
      startCamera()
    }

    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-sm aspect-square bg-black rounded-lg overflow-hidden">
        {isScanning && (
          <>
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" autoPlay playsInline muted />
            <div className="absolute inset-0 border-2 border-white/50 rounded-lg" />
            <div className="absolute inset-16 border-2 border-white rounded-lg" />
          </>
        )}

        {!isScanning && !errorMessage && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <Button onClick={startCamera} className="bg-[#0066cc]">
              <Camera className="mr-2 h-4 w-4" />
              Start Camera
            </Button>
          </div>
        )}

        {errorMessage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-4">
            <p className="mb-4 text-center">{errorMessage}</p>
            <Button onClick={startCamera} className="bg-[#0066cc]">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <p className="mt-4 text-sm text-center text-gray-500">Position the QR code within the square frame to scan</p>
    </div>
  )
}
