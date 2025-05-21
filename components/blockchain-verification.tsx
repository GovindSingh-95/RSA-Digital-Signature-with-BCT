"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Search, Upload, Link } from "lucide-react"
import { storeSignatureOnBlockchain, verifySignatureOnBlockchain } from "@/lib/blockchain-service"

interface BlockchainVerificationProps {
  message: string
  signature: string
  publicKey?: {
    e: string
    n: string
  }
}

export function BlockchainVerification({ message, signature, publicKey }: BlockchainVerificationProps) {
  const [activeTab, setActiveTab] = useState<"store" | "verify">("store")
  const [isLoading, setIsLoading] = useState(false)
  const [transactionHash, setTransactionHash] = useState("")
  const [blockNumber, setBlockNumber] = useState<number | null>(null)
  const [verificationResult, setVerificationResult] = useState<{
    status: "success" | "error" | "pending" | null
    message: string
    timestamp?: string
    blockExplorerUrl?: string
  }>({ status: null, message: "" })
  const [verifyHash, setVerifyHash] = useState("")

  // Store signature on blockchain
  const handleStoreSignature = async () => {
    if (!message || !signature) {
      setVerificationResult({
        status: "error",
        message: "Please provide both message and signature",
      })
      return
    }

    setIsLoading(true)
    setVerificationResult({ status: "pending", message: "Storing signature on blockchain..." })

    try {
      // Call the blockchain service
      const result = await storeSignatureOnBlockchain({
        message,
        signature,
        publicKey: publicKey || { e: "", n: "" },
      })

      // Update state with transaction details
      setTransactionHash(result.transactionHash)
      setBlockNumber(result.blockNumber)
      setVerificationResult({
        status: "success",
        message: "Signature successfully stored on blockchain!",
        timestamp: result.timestamp,
        blockExplorerUrl: result.blockExplorerUrl,
      })
    } catch (error) {
      setVerificationResult({
        status: "error",
        message: `Failed to store on blockchain: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Verify signature from blockchain
  const handleVerifyFromBlockchain = async () => {
    if (!verifyHash) {
      setVerificationResult({
        status: "error",
        message: "Please enter a transaction hash",
      })
      return
    }

    setIsLoading(true)
    setVerificationResult({ status: "pending", message: "Verifying signature from blockchain..." })

    try {
      // Call the blockchain service
      const result = await verifySignatureOnBlockchain(verifyHash)

      // Update verification result
      setVerificationResult({
        status: result.isValid ? "success" : "error",
        message: result.isValid
          ? "Signature verified successfully from blockchain!"
          : "Signature verification failed. The signature may have been tampered with.",
        timestamp: result.timestamp,
        blockExplorerUrl: result.blockExplorerUrl,
      })
    } catch (error) {
      setVerificationResult({
        status: "error",
        message: `Verification failed: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Link className="mr-2 h-5 w-5" />
          Blockchain Verification
        </CardTitle>
        <CardDescription>
          Store your signatures on a blockchain for immutable verification and proof of existence
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="store" value={activeTab} onValueChange={(v) => setActiveTab(v as "store" | "verify")}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="store">
              <Upload className="mr-2 h-4 w-4" />
              Store on Blockchain
            </TabsTrigger>
            <TabsTrigger value="verify">
              <Search className="mr-2 h-4 w-4" />
              Verify from Blockchain
            </TabsTrigger>
          </TabsList>

          <TabsContent value="store" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea value={message} readOnly className="font-mono text-sm h-20" />
              </div>

              <div className="space-y-2">
                <Label>Signature</Label>
                <Textarea value={signature} readOnly className="font-mono text-sm h-20" />
              </div>

              <Button
                onClick={handleStoreSignature}
                disabled={isLoading || !message || !signature}
                className="w-full bg-[#6600cc] hover:bg-[#6600cc]/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Store Signature on Blockchain
                  </>
                )}
              </Button>

              {transactionHash && (
                <div className="p-4 border rounded-md bg-slate-50 space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Transaction Hash:</Label>
                    <Badge variant="outline" className="font-mono text-xs">
                      {transactionHash.substring(0, 10)}...{transactionHash.substring(transactionHash.length - 10)}
                    </Badge>
                  </div>
                  {blockNumber !== null && (
                    <div className="flex justify-between items-center">
                      <Label>Block Number:</Label>
                      <Badge variant="outline" className="font-mono text-xs">
                        {blockNumber}
                      </Badge>
                    </div>
                  )}
                  {verificationResult.timestamp && (
                    <div className="flex justify-between items-center">
                      <Label>Timestamp:</Label>
                      <span className="text-xs">{verificationResult.timestamp}</span>
                    </div>
                  )}
                  {verificationResult.blockExplorerUrl && (
                    <Button
                      variant="link"
                      className="p-0 h-auto text-[#6600cc]"
                      onClick={() => window.open(verificationResult.blockExplorerUrl, "_blank")}
                    >
                      View on Block Explorer
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="verify" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Transaction Hash</Label>
                <div className="flex space-x-2">
                  <Input
                    value={verifyHash}
                    onChange={(e) => setVerifyHash(e.target.value)}
                    placeholder="Enter transaction hash to verify"
                    className="font-mono"
                  />
                  <Button
                    onClick={handleVerifyFromBlockchain}
                    disabled={isLoading || !verifyHash}
                    className="bg-[#00994c] hover:bg-[#00994c]/90 shrink-0"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {verificationResult.status && (
                <Alert
                  variant={
                    verificationResult.status === "success"
                      ? "default"
                      : verificationResult.status === "error"
                        ? "destructive"
                        : "default"
                  }
                  className={
                    verificationResult.status === "success"
                      ? "border-green-500 text-green-700 bg-green-50"
                      : verificationResult.status === "error"
                        ? "border-red-500 text-red-700 bg-red-50"
                        : "border-yellow-500 text-yellow-700 bg-yellow-50"
                  }
                >
                  {verificationResult.status === "success" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : verificationResult.status === "error" ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <AlertTitle>
                    {verificationResult.status === "success"
                      ? "Verification Successful"
                      : verificationResult.status === "error"
                        ? "Verification Failed"
                        : "Processing"}
                  </AlertTitle>
                  <AlertDescription>{verificationResult.message}</AlertDescription>
                </Alert>
              )}

              {verificationResult.status === "success" && (
                <div className="p-4 border rounded-md bg-slate-50 space-y-2">
                  {verificationResult.timestamp && (
                    <div className="flex justify-between items-center">
                      <Label>Timestamp:</Label>
                      <span className="text-xs">{verificationResult.timestamp}</span>
                    </div>
                  )}
                  {verificationResult.blockExplorerUrl && (
                    <Button
                      variant="link"
                      className="p-0 h-auto text-[#6600cc]"
                      onClick={() => window.open(verificationResult.blockExplorerUrl, "_blank")}
                    >
                      View on Block Explorer
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-sm text-gray-500">
          <p className="mb-2">
            <strong>Why use blockchain verification?</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Creates an immutable record of your signature that cannot be altered</li>
            <li>Provides timestamp proof of when the signature was created</li>
            <li>Allows anyone to verify the authenticity of your signature without trusting a central authority</li>
            <li>Creates a permanent record that persists even if the original signer is no longer available</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
