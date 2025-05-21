"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Copy } from "lucide-react"

interface QRCodeGeneratorProps {
  signature: string
  message: string
}

export function QRCodeGenerator({ signature, message }: QRCodeGeneratorProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [qrType, setQrType] = useState<"signature" | "verification">("signature")

  useEffect(() => {
    generateQRCode()
  }, [signature, message, qrType])

  const generateQRCode = async () => {
    try {
      // Dynamically import QRCode.js
      const QRCode = (await import("qrcode")).default

      // Create data object
      const data = {
        type: qrType,
        message: message,
        signature: signature,
        timestamp: new Date().toISOString(),
      }

      // Generate QR code
      const dataUrl = await QRCode.toDataURL(JSON.stringify(data), {
        width: 300,
        margin: 2,
        color: {
          dark: qrType === "signature" ? "#0066cc" : "#00994c",
          light: "#ffffff",
        },
      })

      setQrDataUrl(dataUrl)
    } catch (error) {
      console.error("QR code generation failed:", error)
    }
  }

  const downloadQRCode = () => {
    if (!qrDataUrl) return

    const a = document.createElement("a")
    a.href = qrDataUrl
    a.download = `rsa-${qrType}-qrcode.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const copyQRCodeToClipboard = async () => {
    if (!qrDataUrl) return

    try {
      // Convert data URL to blob
      const response = await fetch(qrDataUrl)
      const blob = await response.blob()

      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ])

      alert("QR code copied to clipboard!")
    } catch (error) {
      console.error("Failed to copy QR code:", error)
      alert("Failed to copy QR code. Your browser may not support this feature.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signature QR Code</CardTitle>
        <CardDescription>Generate a QR code for your digital signature</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="signature"
          value={qrType}
          onValueChange={(value) => setQrType(value as "signature" | "verification")}
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="signature">Signature QR</TabsTrigger>
            <TabsTrigger value="verification">Verification QR</TabsTrigger>
          </TabsList>

          <TabsContent value="signature" className="space-y-4">
            <div className="flex justify-center p-4 bg-white rounded-md border">
              {qrDataUrl ? (
                <img src={qrDataUrl || "/placeholder.svg"} alt="Signature QR Code" className="max-w-full" />
              ) : (
                <div className="h-[300px] w-[300px] flex items-center justify-center bg-gray-100">
                  Generating QR code...
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600">
              This QR code contains your message and its digital signature. Share it with others who need to verify your
              signature.
            </p>
          </TabsContent>

          <TabsContent value="verification" className="space-y-4">
            <div className="flex justify-center p-4 bg-white rounded-md border">
              {qrDataUrl ? (
                <img src={qrDataUrl || "/placeholder.svg"} alt="Verification QR Code" className="max-w-full" />
              ) : (
                <div className="h-[300px] w-[300px] flex items-center justify-center bg-gray-100">
                  Generating QR code...
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600">
              This QR code contains verification information. Use it to quickly verify the authenticity of the message.
            </p>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center space-x-4 mt-6">
          <Button onClick={downloadQRCode} className="bg-[#0066cc]">
            <Download className="mr-2 h-4 w-4" />
            Download QR Code
          </Button>
          <Button onClick={copyQRCodeToClipboard} variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Copy to Clipboard
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
