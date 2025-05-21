"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface MobileHeaderProps {
  title: string
  onBack?: () => void
}

export function MobileHeader({ title, onBack }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-[#0066cc] text-white p-4 flex items-center shadow-md">
      {onBack && (
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 text-white hover:bg-[#0055aa]">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
      <h1 className="text-lg font-bold">{title}</h1>
    </header>
  )
}
