"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { verifySignature } from "@/lib/rsa-utils"
import { verifySignatureOnBlockchain } from "@/lib/blockchain-service"
import { verifyTimestamp, type TimestampResponse } from "@/lib/timestamp-service"
import { MobileQrScanner } from "@/components/mobile-qr-scanner"
import { MobileHeader } from "@/components/mobile-header"
import { MobileVerificationResult } from "@/components/mobile-verification-result"
import { ArrowLeft, Camera, Clock, ClipboardCheck, Link, ShieldCheck } from "lucide-react"

export default function MobileCompanionApp() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"manual" | "qrcode" | "blockchain" | "timestamp">("qrcode")
  const [message, setMessage] = useState("")
  const [signature, setSignature] = useState("")
  const [publicKey, setPublicKey] = useState({ e: "65537", n: "" })
  const [blockchainHash, setBlockchainHash] = useState("")
  const [timestampToken, setTimestampToken] = useState<string>("")
  const [verificationResult, setVerificationResult] = useState<{
    status: "success" | "error" | "pending" | null
    message: string
    timestamp?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  // Handle QR code scan result
  const handleScanResult = (data: string) => {
    try {
      const parsedData = JSON.parse(data)
      if (parsedData.message && parsedData.signature) {
        setMessage(parsedData.message)
        setSignature(parsedData.signature)
        if (parsedData.publicKey) {
          setPublicKey(parsedData.publicKey)
        }
        if (parsedData.timestampToken) {
          setTimestampToken(JSON.stringify(parsedData.timestampToken, null, 2))
          setActiveTab("timestamp")
        } else {
          setActiveTab("manual")
        }
        setShowScanner(false)

        // Automatically verify after scan if we have all the data
        if (parsedData.publicKey && parsedData.publicKey.n) {
          setTimeout(() => {
            handleVerifySignature()
          }, 500)
        }
      }
    } catch (error) {
      setVerificationResult({
        status: "error",
        message: "Invalid QR code format. Please scan a valid signature QR code.",
      })
    }
  }

  // Verify signature manually
  const handleVerifySignature = async () => {
    if (!message || !signature || !publicKey.n) {
      setVerificationResult({
        status: "error",
        message: "Please provide message, signature, and public key",
      })
      return
    }

    setIsLoading(true)
    setVerificationResult({
      status: "pending",
      message: "Verifying signature...",
    })

    try {
      // Add a small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 800))

      const result = await verifySignature(message, signature, publicKey.e, publicKey.n)

      if (result.isValid) {
        // Trigger success haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100])
        }

        setVerificationResult({
          status: "success",
          message: "Signature is valid! The message is authentic and has not been tampered with.",
          timestamp: new Date().toISOString(),
        })
      } else {
        // Trigger error haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(300)
        }

        setVerificationResult({
          status: "error",
          message:
            "Signature verification failed. The message may have been tampered with or the wrong public key was used.",
        })
      }
    } catch (error) {
      setVerificationResult({
        status: "error",
        message: `Verification error: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Verify from blockchain
  const handleVerifyFromBlockchain = async () => {
    if (!blockchainHash) {
      setVerificationResult({
        status: "error",
        message: "Please enter a transaction hash",
      })
      return
    }

    setIsLoading(true)
    setVerificationResult({
      status: "pending",
      message: "Verifying from blockchain...",
    })

    try {
      // Add a small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const result = await verifySignatureOnBlockchain(blockchainHash)

      if (result.isValid) {
        // Trigger success haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100])
        }

        setVerificationResult({
          status: "success",
          message: "Blockchain verification successful! The signature is valid and was recorded on the blockchain.",
          timestamp: result.timestamp,
        })

        // Populate the form with the blockchain data
        setMessage(result.message)
        setSignature(result.signature)
        setPublicKey(result.publicKey)
      } else {
        // Trigger error haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(300)
        }

        setVerificationResult({
          status: "error",
          message: "Blockchain verification failed. The signature may be invalid or the transaction hash is incorrect.",
        })
      }
    } catch (error) {
      setVerificationResult({
        status: "error",
        message: `Blockchain verification error: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Verify timestamp
  const handleVerifyTimestamp = async () => {
    if (!timestampToken) {
      setVerificationResult({
        status: "error",
        message: "Please enter a timestamp token",
      })
      return
    }

    setIsLoading(true)
    setVerificationResult({
      status: "pending",
      message: "Verifying timestamp...",
    })

    try {
      // Parse the timestamp token
      const token = JSON.parse(timestampToken) as TimestampResponse

      // Verify the timestamp
      const result = await verifyTimestamp(token)

      if (result.isValid) {
        // Trigger success haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100])
        }

        setVerificationResult({
          status: "success",
          message: `Timestamp is valid! This document was timestamped by ${result.tsaName} at ${new Date(
            result.timestamp,
          ).toLocaleString()}.`,
          timestamp: result.timestamp,
        })
      } else {
        // Trigger error haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(300)
        }

        setVerificationResult({
          status: "error",
          message: `Timestamp verification failed: ${result.error || "Unknown error"}`,
        })
      }
    } catch (error) {
      setVerificationResult({
        status: "error",
        message: `Timestamp verification error: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle paste from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      try {
        const data = JSON.parse(text)
        if (data.message && data.signature) {
          setMessage(data.message)
          setSignature(data.signature)
          if (data.publicKey) {
            setPublicKey(data.publicKey)
          }
          if (data.timestampToken) {
            setTimestampToken(JSON.stringify(data.timestampToken, null, 2))
            setActiveTab("timestamp")
          }
          setVerificationResult({
            status: "pending",
            message: "Data pasted from clipboard. Ready to verify.",
          })
        } else if (data.timestamp && data.hash && data.timestampToken) {
          // This looks like a timestamp token
          setTimestampToken(text)
          setActiveTab("timestamp")
        }
      } catch {
        // If not JSON, assume it's a transaction hash
        if (text.startsWith("0x") && text.length > 30) {
          setBlockchainHash(text)
          setActiveTab("blockchain")
        } else {
          // Just paste as message
          setMessage(text)
        }
      }
    } catch (error) {
      setVerificationResult({
        status: "error",
        message: "Failed to read from clipboard. Please check browser permissions.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col">
      <MobileHeader title="RSA Signature Verifier" onBack={() => router.push("/")} />

      <main className="flex-1 p-4">
        {showScanner ? (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Button variant="ghost" size="sm" className="mr-2 h-8 w-8 p-0" onClick={() => setShowScanner(false)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                Scan QR Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MobileQrScanner onScan={handleScanResult} />
            </CardContent>
          </Card>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-4">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="qrcode">
                  <Camera className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">QR Scan</span>
                </TabsTrigger>
                <TabsTrigger value="manual">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Manual</span>
                </TabsTrigger>
                <TabsTrigger value="timestamp">
                  <Clock className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Timestamp</span>
                </TabsTrigger>
                <TabsTrigger value="blockchain">
                  <Link className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Blockchain</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="qrcode" className="mt-4">
                <Card>
                  <CardContent className="pt-6 flex flex-col items-center justify-center space-y-4">
                    <div className="text-center mb-4">
                      <p>Scan a signature QR code to verify</p>
                      <p className="text-sm text-gray-500 mt-1">Position the QR code within the scanner frame</p>
                    </div>

                    <Button onClick={() => setShowScanner(true)} className="bg-[#0066cc] w-full">
                      <Camera className="mr-2 h-4 w-4" />
                      Open Camera
                    </Button>

                    <div className="w-full relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-2 text-sm text-gray-500">OR</span>
                      </div>
                    </div>

                    <Button variant="outline" onClick={handlePasteFromClipboard} className="w-full">
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      Paste from Clipboard
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message</label>
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter the message to verify"
                        className="font-mono text-sm h-20"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Signature</label>
                      <Textarea
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        placeholder="Enter the signature"
                        className="font-mono text-sm h-20"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Public Key (n)</label>
                      <Input
                        value={publicKey.n}
                        onChange={(e) => setPublicKey({ ...publicKey, n: e.target.value })}
                        placeholder="Enter the public key modulus (n)"
                        className="font-mono text-sm"
                      />
                    </div>

                    <Button
                      onClick={handleVerifySignature}
                      disabled={isLoading || !message || !signature || !publicKey.n}
                      className="w-full bg-[#00994c]"
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2">⟳</span> Verifying...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <ShieldCheck className="mr-2 h-4 w-4" /> Verify Signature
                        </span>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timestamp" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Timestamp Token (JSON)</label>
                      <Textarea
                        value={timestampToken}
                        onChange={(e) => setTimestampToken(e.target.value)}
                        placeholder='{"timestamp": "2023-06-15T12:34:56.789Z", "hash": "...", ...}'
                        className="font-mono text-sm h-32"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={handleVerifyTimestamp}
                        disabled={isLoading || !timestampToken}
                        className="flex-1 bg-[#0066cc]"
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <span className="animate-spin mr-2">⟳</span> Verifying...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" /> Verify Timestamp
                          </span>
                        )}
                      </Button>
                      <Button variant="outline" size="icon" onClick={handlePasteFromClipboard} className="shrink-0">
                        <ClipboardCheck className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="blockchain" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Transaction Hash</label>
                      <div className="flex space-x-2">
                        <Input
                          value={blockchainHash}
                          onChange={(e) => setBlockchainHash(e.target.value)}
                          placeholder="Enter blockchain transaction hash"
                          className="font-mono text-sm"
                        />
                        <Button variant="outline" size="icon" onClick={handlePasteFromClipboard} className="shrink-0">
                          <ClipboardCheck className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={handleVerifyFromBlockchain}
                      disabled={isLoading || !blockchainHash}
                      className="w-full bg-[#6600cc]"
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2">⟳</span> Verifying...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Link className="mr-2 h-4 w-4" /> Verify from Blockchain
                        </span>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {verificationResult && <MobileVerificationResult result={verificationResult} />}
          </>
        )}
      </main>

      <CardFooter className="border-t bg-white p-4 text-center text-sm text-gray-500">
        RSA Digital Signature Mobile Companion
      </CardFooter>
    </div>
  )
}
