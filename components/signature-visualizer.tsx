"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SignatureVisualizerProps {
  signatureData: {
    message: string
    hash: string
    signature: string
    timestamp: string
  }
}

export function SignatureVisualizer({ signatureData }: SignatureVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !signatureData) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = 400

    // Draw the visualization
    drawSignatureVisualization(ctx, canvas.width, canvas.height, signatureData)
  }, [signatureData])

  const drawSignatureVisualization = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    data: SignatureVisualizerProps["signatureData"],
  ) => {
    // Background
    ctx.fillStyle = "#f8f9fa"
    ctx.fillRect(0, 0, width, height)

    // Create a unique pattern based on the signature
    const signatureBytes = stringToBytes(data.signature)
    const hashBytes = stringToBytes(data.hash)

    // Draw message flow
    const centerY = height / 2
    const startX = 50
    const endX = width - 50

    // Message box
    drawBox(ctx, startX, centerY - 80, 120, 40, "#0066cc", "Message")

    // Arrow to hash
    drawArrow(ctx, startX + 120, centerY - 60, startX + 180, centerY - 60, "#333")

    // Hash box
    drawBox(ctx, startX + 180, centerY - 80, 120, 40, "#00994c", "Hash")

    // Arrow to signature
    drawArrow(ctx, startX + 300, centerY - 60, startX + 360, centerY - 60, "#333")

    // Signature box
    drawBox(ctx, startX + 360, centerY - 80, 120, 40, "#ff9900", "Signature")

    // Draw private key involvement
    drawBox(ctx, startX + 240, centerY + 20, 100, 40, "#cc0033", "Private Key")
    drawArrow(ctx, startX + 290, centerY + 20, startX + 290, centerY - 40, "#cc0033")

    // Draw verification flow
    drawBox(ctx, startX + 360, centerY + 80, 120, 40, "#6600cc", "Verification")
    drawArrow(ctx, startX + 420, centerY + 80, startX + 420, centerY - 40, "#6600cc")

    // Draw public key involvement
    drawBox(ctx, startX + 180, centerY + 80, 100, 40, "#009999", "Public Key")
    drawArrow(ctx, startX + 280, centerY + 100, startX + 360, centerY + 100, "#009999")

    // Draw pattern based on signature
    drawSignaturePattern(ctx, 50, height - 80, width - 100, 60, signatureBytes)
  }

  const drawBox = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    text: string,
  ) => {
    // Box
    ctx.fillStyle = color
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, 8)
    ctx.fill()

    // Text
    ctx.fillStyle = "white"
    ctx.font = "14px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(text, x + width / 2, y + height / 2)
  }

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string,
  ) => {
    const headLength = 10
    const angle = Math.atan2(toY - fromY, toX - fromX)

    // Line
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.stroke()

    // Arrow head
    ctx.beginPath()
    ctx.moveTo(toX, toY)
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6))
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6))
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
  }

  const drawSignaturePattern = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    bytes: number[],
  ) => {
    const segmentWidth = width / Math.min(bytes.length, 100)

    ctx.fillStyle = "rgba(0, 102, 204, 0.1)"
    ctx.fillRect(x, y, width, height)

    ctx.strokeStyle = "#0066cc"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x, y + height / 2)

    for (let i = 0; i < Math.min(bytes.length, 100); i++) {
      const value = bytes[i] / 255
      const yPos = y + height / 2 - (value * height) / 2
      ctx.lineTo(x + i * segmentWidth, yPos)
    }

    ctx.stroke()
  }

  const stringToBytes = (str: string): number[] => {
    // Convert the first 100 chars of the string to byte values
    const bytes: number[] = []
    for (let i = 0; i < Math.min(str.length, 100); i++) {
      bytes.push(str.charCodeAt(i) % 256)
    }
    return bytes
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signature Visualization</CardTitle>
        <CardDescription>Visual representation of the RSA signature process</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md p-4 bg-white">
          <canvas ref={canvasRef} className="w-full" style={{ height: "400px" }} />
        </div>
        <div className="mt-4 text-sm">
          <p>
            <strong>Message:</strong> {signatureData.message.substring(0, 30)}
            {signatureData.message.length > 30 ? "..." : ""}
          </p>
          <p>
            <strong>Timestamp:</strong> {new Date(signatureData.timestamp).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
