"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { createHash } from "crypto"
import { type TimestampResponse, verifyTimestamp } from "@/lib/timestamp-service"
import { CheckCircle, Clock, Loader2, XCircle } from "lucide-react"

interface TimestampVerificationProps {
  timestampToken?: TimestampResponse
  signatureData?: {
    message: string
    signature: string
  }
}

export function TimestampVerification({ timestampToken, signatureData }: TimestampVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean
    timestamp: string
    serialNumber: string
    tsaName: string
    error?: string
  } | null>(null)
  const [tokenInput, setTokenInput] = useState<string>(timestampToken ? JSON.stringify(timestampToken, null, 2) : "")

  const handleVerifyTimestamp = async () => {
    if (!timestampToken && !tokenInput) {
      return
    }

    setIsVerifying(true)
    try {
      const token = timestampToken || JSON.parse(tokenInput)
      const result = await verifyTimestamp(token)
      setVerificationResult(result)
    } catch (error) {
      setVerificationResult({
        isValid: false,
        timestamp: "",
        serialNumber: "",
        tsaName: "",
        error: `Invalid timestamp token format: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Timestamp Verification
        </CardTitle>
        <CardDescription>Verify the trusted timestamp to prove when the signature was created</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {timestampToken ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-md border space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">Timestamp:</span>
                <span className="text-sm">{new Date(timestampToken.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">Serial Number:</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {timestampToken.serialNumber}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">Authority:</span>
                <span className="text-sm">{timestampToken.tsaName}</span>
              </div>
              <Separator />
              <div className="space-y-1">
                <span className="font-medium text-sm">Hash:</span>
                <div className="bg-white p-2 rounded border font-mono text-xs break-all">{timestampToken.hash}</div>
              </div>
            </div>

            {signatureData && (
              <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                <h4 className="font-medium mb-2">Timestamped Data</h4>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <span className="text-xs font-medium">Message:</span>
                    <div className="bg-white p-2 rounded border font-mono text-xs max-h-20 overflow-y-auto">
                      {signatureData.message}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-medium">Signature:</span>
                    <div className="bg-white p-2 rounded border font-mono text-xs max-h-20 overflow-y-auto">
                      {signatureData.signature}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-medium">Calculated Hash:</span>
                    <div className="bg-white p-2 rounded border font-mono text-xs break-all">
                      {createHash("sha256").update(`${signatureData.message}|${signatureData.signature}`).digest("hex")}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button onClick={handleVerifyTimestamp} disabled={isVerifying} className="w-full bg-[#0066cc]">
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying Timestamp...
                </>
              ) : (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Verify Timestamp
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Timestamp Token (JSON):</label>
              <Textarea
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder='{"timestamp": "2023-06-15T12:34:56.789Z", "hash": "...", ...}'
                className="font-mono text-sm min-h-[150px]"
              />
            </div>

            <Button
              onClick={handleVerifyTimestamp}
              disabled={isVerifying || !tokenInput}
              className="w-full bg-[#0066cc]"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying Timestamp...
                </>
              ) : (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Verify Timestamp
                </>
              )}
            </Button>
          </div>
        )}

        {verificationResult && (
          <Alert
            variant={verificationResult.isValid ? "default" : "destructive"}
            className={
              verificationResult.isValid
                ? "border-green-500 text-green-700 bg-green-50"
                : "border-red-500 text-red-700 bg-red-50"
            }
          >
            {verificationResult.isValid ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertTitle>{verificationResult.isValid ? "Timestamp Valid" : "Timestamp Invalid"}</AlertTitle>
            <AlertDescription>
              {verificationResult.isValid
                ? `This timestamp was issued by ${verificationResult.tsaName} at ${new Date(
                    verificationResult.timestamp,
                  ).toLocaleString()}`
                : verificationResult.error || "The timestamp could not be verified"}
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4 text-sm text-gray-500">
          <h4 className="font-medium mb-1">About Trusted Timestamping</h4>
          <p className="mb-2">
            Trusted timestamping provides cryptographic proof that a document or signature existed at a specific point
            in time. This is achieved by having a trusted third party (Timestamp Authority) certify the time of the
            signature.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Prevents backdating or forward-dating of signatures</li>
            <li>Provides legal evidence of when a document was signed</li>
            <li>Enhances non-repudiation by proving time of signature</li>
            <li>Complies with standards like RFC 3161 for trusted timestamping</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
