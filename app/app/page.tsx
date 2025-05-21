"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateRSAKeys, signMessage, verifySignature } from "@/lib/rsa-utils"
import { requestTimestamp, type TimestampResponse } from "@/lib/timestamp-service"
import { createHash } from "crypto"
import { addSignatureHistoryEntry } from "@/lib/history-service"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Download,
  Eye,
  History,
  KeyRound,
  Link,
  PenTool,
  ShieldCheck,
  Smartphone,
  Trash2,
} from "lucide-react"
import { SignatureVisualizer } from "@/components/signature-visualizer"
import { EducationalModal } from "@/components/educational-modal"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { SignatureStrengthMeter } from "@/components/signature-strength-meter"
import { BlockchainVerification } from "@/components/blockchain-verification"
import { TimestampVerification } from "@/components/timestamp-verification"
import { SignatureHistory } from "@/components/signature-history"

export default function RSADigitalSignatureApp() {
  const router = useRouter()
  // State for message, signature, and logs
  const [message, setMessage] = useState("")
  const [signature, setSignature] = useState("")
  const [logs, setLogs] = useState("System ready...")
  const [status, setStatus] = useState("Ready")
  const [activeTab, setActiveTab] = useState("sign")
  const [showEducationalModal, setShowEducationalModal] = useState(false)
  const [signatureData, setSignatureData] = useState<any>(null)
  const [signatureStrength, setSignatureStrength] = useState(0)
  const [timestampToken, setTimestampToken] = useState<TimestampResponse | null>(null)
  const [isTimestamping, setIsTimestamping] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  // RSA key state
  const [keys, setKeys] = useState<{
    n: string
    e: string
    d: string
  } | null>(null)

  // Canvas ref for visualization
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Generate RSA keys
  const handleGenerateKeys = async () => {
    try {
      setLogs("Generating RSA keys...")
      setStatus("Generating keys...")

      // Use setTimeout to make the UI feel more responsive
      setTimeout(async () => {
        const generatedKeys = await generateRSAKeys()
        setKeys(generatedKeys)
        setLogs(
          `Keys generated:\nPublic (e,n):\n${generatedKeys.e}\n${generatedKeys.n}\n\nPrivate (d):\n${generatedKeys.d}`,
        )
        setStatus("Keys generated successfully")
        setSignatureStrength(calculateKeyStrength(generatedKeys.n))
      }, 500)
    } catch (error) {
      setLogs(`Key generation failed: ${error instanceof Error ? error.message : String(error)}`)
      setStatus("Key generation failed")
    }
  }

  // Calculate key strength based on bit length
  const calculateKeyStrength = (n: string) => {
    const bitLength = new Uint8Array(Buffer.from(n)).length * 8
    // Return a score from 0-100 based on key size
    return Math.min(100, (bitLength / 4096) * 100)
  }

  // Sign a message
  const handleSignMessage = async () => {
    if (!message) {
      setLogs("Error: Please enter a message")
      setStatus("Error: Empty message")
      return
    }

    if (!keys) {
      setLogs("Error: Please generate keys first")
      setStatus("Error: No keys")
      return
    }

    try {
      const { signature: generatedSignature, hash } = await signMessage(message, keys.d, keys.n)
      setSignature(generatedSignature)

      // Create signature data for visualization
      const signatureData = {
        message,
        hash,
        signature: generatedSignature,
        timestamp: new Date().toISOString(),
      }
      setSignatureData(signatureData)

      setLogs(`Message signed\nHash: ${hash}\nSignature: ${generatedSignature}`)
      setStatus("Message signed successfully")

      // Reset timestamp token when a new signature is created
      setTimestampToken(null)

      // Add to history
      addSignatureHistoryEntry({
        type: "creation",
        message,
        signature: generatedSignature,
        publicKey: {
          e: keys.e,
          n: keys.n,
        },
      })
    } catch (error) {
      setLogs(`Signing failed: ${error instanceof Error ? error.message : String(error)}`)
      setStatus("Signing failed")
    }
  }

  // Request a timestamp for the signature
  const handleRequestTimestamp = async () => {
    if (!message || !signature) {
      setLogs("Error: Please sign a message first")
      setStatus("Error: No signature")
      return
    }

    setIsTimestamping(true)
    setLogs(`${logs}\nRequesting trusted timestamp...`)
    setStatus("Requesting timestamp...")

    try {
      // Create a hash of the message and signature
      const dataToTimestamp = `${message}|${signature}`
      const hash = createHash("sha256").update(dataToTimestamp).digest("hex")

      // Request timestamp from the timestamp authority
      const timestampResponse = await requestTimestamp({
        hash,
        signatureData: {
          message,
          signature,
        },
      })

      setTimestampToken(timestampResponse)
      setLogs(
        `${logs}\nTimestamp received:\nTime: ${new Date(
          timestampResponse.timestamp,
        ).toLocaleString()}\nSerial: ${timestampResponse.serialNumber}\nAuthority: ${timestampResponse.tsaName}`,
      )
      setStatus("Timestamp received")

      // Add to history
      addSignatureHistoryEntry({
        type: "timestamp",
        message,
        signature,
        publicKey: keys
          ? {
              e: keys.e,
              n: keys.n,
            }
          : undefined,
        timestampToken: timestampResponse,
        result: {
          isValid: true,
          details: `Timestamp issued by ${timestampResponse.tsaName} at ${new Date(timestampResponse.timestamp).toLocaleString()}`,
        },
      })

      // Switch to timestamp tab
      setActiveTab("timestamp")
    } catch (error) {
      setLogs(`${logs}\nTimestamp request failed: ${error instanceof Error ? error.message : String(error)}`)
      setStatus("Timestamp failed")
    } finally {
      setIsTimestamping(false)
    }
  }

  // Verify a signature
  const handleVerifySignature = async () => {
    if (!message || !signature) {
      setLogs("Error: Message and signature required")
      setStatus("Error: Missing data")
      return
    }

    if (!keys) {
      setLogs("Error: Please generate keys first")
      setStatus("Error: No keys")
      return
    }

    try {
      const { isValid, hash, decrypted } = await verifySignature(message, signature, keys.e, keys.n)

      if (isValid) {
        setLogs(`✅ Signature VALID\nHash: ${hash}`)
        setStatus("Valid signature")

        // Add to history
        addSignatureHistoryEntry({
          type: "verification",
          message,
          signature,
          publicKey: {
            e: keys.e,
            n: keys.n,
          },
          result: {
            isValid: true,
            details: `Signature verified successfully. Hash: ${hash}`,
          },
        })
      } else {
        setLogs(`❌ Signature INVALID\nExpected: ${hash}\nGot: ${decrypted}`)
        setStatus("Invalid signature")

        // Add to history
        addSignatureHistoryEntry({
          type: "verification",
          message,
          signature,
          publicKey: {
            e: keys.e,
            n: keys.n,
          },
          result: {
            isValid: false,
            details: `Signature verification failed. Expected hash: ${hash}, Got: ${decrypted}`,
          },
        })
      }
    } catch (error) {
      setLogs(`Verification failed: ${error instanceof Error ? error.message : String(error)}`)
      setStatus("Verification failed")
    }
  }

  // Export keys and signature as JSON
  const handleExportData = () => {
    if (!keys || !signature) {
      setLogs("Error: Generate keys and sign a message first")
      return
    }

    const exportData = {
      publicKey: {
        e: keys.e,
        n: keys.n,
      },
      message,
      signature,
      timestamp: new Date().toISOString(),
      timestampToken: timestampToken || undefined,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "rsa-signature-data.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setLogs("Exported signature data as JSON")
  }

  // Clear all fields
  const handleClearAll = () => {
    setMessage("")
    setSignature("")
    setLogs("System cleared")
    setStatus("Ready")
    setSignatureData(null)
    setTimestampToken(null)
  }

  // Open mobile companion app
  const handleOpenMobileApp = () => {
    router.push("/mobile")
  }

  // Return to landing page
  const handleReturnToLanding = () => {
    router.push("/")
  }

  // Handle selecting a signature from history
  const handleSelectSignature = (data: {
    message: string
    signature: string
    publicKey?: { e: string; n: string }
  }) => {
    setMessage(data.message)
    setSignature(data.signature)
    if (data.publicKey && !keys) {
      setKeys({
        e: data.publicKey.e,
        n: data.publicKey.n,
        d: "", // We don't have the private key from history
      })
    }
    setShowHistory(false)
    setActiveTab("sign")
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-6">
      <header className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
        <Button variant="ghost" onClick={handleReturnToLanding} className="text-[#0066cc]">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="text-[#0066cc] border-[#0066cc]"
          >
            <History className="mr-2 h-4 w-4" />
            History
          </Button>
          <Button variant="outline" size="sm" onClick={handleOpenMobileApp} className="text-[#0066cc] border-[#0066cc]">
            <Smartphone className="mr-2 h-4 w-4" />
            Mobile App
          </Button>
        </div>
      </header>

      {showHistory ? (
        <div className="max-w-4xl mx-auto">
          <SignatureHistory onSelectSignature={handleSelectSignature} />
        </div>
      ) : (
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader className="bg-[#0066cc] text-white">
            <CardTitle className="text-2xl font-bold">RSA Digital Signature</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Tabs defaultValue="sign" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="sign">Sign & Verify</TabsTrigger>
                <TabsTrigger value="timestamp">
                  <Clock className="mr-2 h-4 w-4" />
                  Timestamp
                </TabsTrigger>
                <TabsTrigger value="visualize">Visualize</TabsTrigger>
                <TabsTrigger value="qrcode">QR Code</TabsTrigger>
                <TabsTrigger value="blockchain">
                  <Link className="mr-2 h-4 w-4" />
                  Blockchain
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sign" className="space-y-4">
                {/* Message Area */}
                <div className="space-y-2">
                  <label className="text-[#0066cc] font-semibold text-sm">Message to Sign/Verify:</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message here..."
                    className="font-mono text-sm min-h-[80px]"
                  />
                </div>

                {/* Signature Area */}
                <div className="space-y-2">
                  <label className="text-[#0066cc] font-semibold text-sm">Digital Signature:</label>
                  <Textarea
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder=""
                    className="font-mono text-sm min-h-[60px]"
                    readOnly={true}
                  />
                </div>

                {/* Signature Strength Meter */}
                {keys && <SignatureStrengthMeter strength={signatureStrength} />}

                {/* Timestamp Request Button */}
                {signature && !timestampToken && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRequestTimestamp}
                      disabled={isTimestamping || !signature}
                      className="text-[#0066cc] border-[#0066cc]"
                    >
                      {isTimestamping ? (
                        <>
                          <span className="animate-spin mr-2">⟳</span> Requesting...
                        </>
                      ) : (
                        <>
                          <Clock className="mr-2 h-4 w-4" /> Request Timestamp
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Log Area */}
                <div className="space-y-2">
                  <label className="text-[#0066cc] font-semibold text-sm">System Log:</label>
                  <Textarea value={logs} className="font-mono text-sm min-h-[150px] bg-white" readOnly={true} />
                </div>
              </TabsContent>

              <TabsContent value="timestamp">
                {timestampToken ? (
                  <TimestampVerification
                    timestampToken={timestampToken}
                    signatureData={
                      message && signature
                        ? {
                            message,
                            signature,
                          }
                        : undefined
                    }
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg">
                    <Clock className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-4 text-center">
                      No timestamp available. Sign a message and request a timestamp to prove when your signature was
                      created.
                    </p>
                    <div className="flex gap-4">
                      <Button onClick={() => setActiveTab("sign")} variant="outline">
                        Go to Sign Tab
                      </Button>
                      {signature && (
                        <Button onClick={handleRequestTimestamp} disabled={isTimestamping} className="bg-[#0066cc]">
                          {isTimestamping ? (
                            <>
                              <span className="animate-spin mr-2">⟳</span> Requesting...
                            </>
                          ) : (
                            <>
                              <Clock className="mr-2 h-4 w-4" /> Request Timestamp
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="visualize">
                {signatureData ? (
                  <SignatureVisualizer signatureData={signatureData} />
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg">
                    <p className="text-gray-500 mb-4">Sign a message first to visualize the signature</p>
                    <Button onClick={() => setActiveTab("sign")} variant="outline">
                      Go to Sign Tab
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="qrcode">
                {signature ? (
                  <QRCodeGenerator signature={signature} message={message} />
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg">
                    <p className="text-gray-500 mb-4">Sign a message first to generate a QR code</p>
                    <Button onClick={() => setActiveTab("sign")} variant="outline">
                      Go to Sign Tab
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="blockchain">
                {signature ? (
                  <BlockchainVerification
                    message={message}
                    signature={signature}
                    publicKey={keys ? { e: keys.e, n: keys.n } : undefined}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg">
                    <p className="text-gray-500 mb-4">Sign a message first to use blockchain verification</p>
                    <Button onClick={() => setActiveTab("sign")} variant="outline">
                      Go to Sign Tab
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Button Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
              <Button onClick={handleGenerateKeys} className="bg-[#00994c] hover:bg-[#00994c]/90 text-white">
                <KeyRound className="mr-2 h-4 w-4" />
                Generate Keys
              </Button>

              <Button
                onClick={handleSignMessage}
                className="bg-[#0066cc] hover:bg-[#0066cc]/90 text-white"
                disabled={!keys}
              >
                <PenTool className="mr-2 h-4 w-4" />
                Sign Message
              </Button>

              <Button
                onClick={handleVerifySignature}
                className="bg-[#ff9900] hover:bg-[#ff9900]/90 text-white"
                disabled={!keys || !signature}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Verify Signature
              </Button>

              <Button
                onClick={handleExportData}
                className="bg-[#6600cc] hover:bg-[#6600cc]/90 text-white"
                disabled={!keys || !signature}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>

              <Button onClick={handleClearAll} className="bg-[#cc0033] hover:bg-[#cc0033]/90 text-white">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </div>

            {/* Educational Button */}
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={() => setShowEducationalModal(true)} className="text-[#0066cc]">
                <Eye className="mr-2 h-4 w-4" />
                Learn How RSA Works
              </Button>
            </div>

            {/* Status Bar */}
            <div className="border border-gray-300 bg-white p-2 text-sm flex items-center">
              {status.includes("Valid") ? (
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              ) : status.includes("Error") || status.includes("failed") || status.includes("Invalid") ? (
                <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
              ) : null}
              {status}
            </div>
          </CardContent>
        </Card>
      )}

      {showEducationalModal && <EducationalModal onClose={() => setShowEducationalModal(false)} />}
    </div>
  )
}
