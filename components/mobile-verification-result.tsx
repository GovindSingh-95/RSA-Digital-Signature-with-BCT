"use client"

import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface MobileVerificationResultProps {
  result: {
    status: "success" | "error" | "pending" | null
    message: string
    timestamp?: string
  }
}

export function MobileVerificationResult({ result }: MobileVerificationResultProps) {
  if (!result.status) return null

  return (
    <Alert
      variant={result.status === "success" ? "default" : result.status === "error" ? "destructive" : "default"}
      className={
        result.status === "success"
          ? "border-green-500 text-green-700 bg-green-50"
          : result.status === "error"
            ? "border-red-500 text-red-700 bg-red-50"
            : "border-yellow-500 text-yellow-700 bg-yellow-50"
      }
    >
      {result.status === "success" ? (
        <CheckCircle className="h-4 w-4" />
      ) : result.status === "error" ? (
        <XCircle className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <AlertTitle>
        {result.status === "success"
          ? "Verification Successful"
          : result.status === "error"
            ? "Verification Failed"
            : "Processing"}
      </AlertTitle>
      <AlertDescription>{result.message}</AlertDescription>

      {result.timestamp && (
        <div className="mt-2 text-xs">
          <strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleString()}
        </div>
      )}
    </Alert>
  )
}
