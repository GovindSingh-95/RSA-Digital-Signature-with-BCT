"use client"

import { Progress } from "@/components/ui/progress"

interface SignatureStrengthMeterProps {
  strength: number
}

export function SignatureStrengthMeter({ strength }: SignatureStrengthMeterProps) {
  // Determine color based on strength
  const getColorClass = () => {
    if (strength < 30) return "bg-red-500"
    if (strength < 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  // Determine strength label
  const getStrengthLabel = () => {
    if (strength < 30) return "Weak"
    if (strength < 70) return "Moderate"
    return "Strong"
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[#0066cc] font-semibold text-sm">Signature Strength:</label>
        <span className="text-sm font-medium">
          {getStrengthLabel()} ({Math.round(strength)}%)
        </span>
      </div>
      <Progress value={strength} className={getColorClass()} />
      <p className="text-xs text-gray-500">Based on key size and cryptographic parameters</p>
    </div>
  )
}
