"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  FileDigit,
  KeyRound,
  Link,
  PenTool,
  ShieldCheck,
  Smartphone,
} from "lucide-react"
import { MobileHeader } from "@/components/mobile-header"

export default function GetStartedPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  const handleGetStarted = () => {
    router.push("/")
  }

  const handleMobileApp = () => {
    router.push("/mobile")
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0]">
      <MobileHeader title="Get Started" onBack={() => router.push("/")} />

      <main className="container mx-auto py-8 px-4">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#0066cc] to-[#0055aa] text-white text-center">
            <CardTitle className="text-3xl font-bold">Welcome to RSA Digital Signature</CardTitle>
            <CardDescription className="text-white/90 text-lg">
              Secure, verify, and visualize digital signatures
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-full bg-[#0066cc] flex items-center justify-center">
                <FileDigit className="h-12 w-12 text-white" />
              </div>
            </div>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="guide">How To Use</TabsTrigger>
                <TabsTrigger value="mobile">Mobile App</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <h2 className="text-2xl font-bold text-[#0066cc]">What is RSA Digital Signature?</h2>
                <p>
                  RSA Digital Signature is a powerful tool that allows you to create and verify digital signatures using
                  the RSA cryptographic algorithm. Digital signatures provide authentication, non-repudiation, and
                  integrity verification for your digital messages and documents.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <FeatureCard
                    icon={<ShieldCheck className="h-8 w-8 text-[#00994c]" />}
                    title="Security"
                    description="Cryptographically secure signatures that can't be forged without the private key"
                  />
                  <FeatureCard
                    icon={<CheckCircle className="h-8 w-8 text-[#ff9900]" />}
                    title="Verification"
                    description="Easily verify the authenticity and integrity of signed messages"
                  />
                  <FeatureCard
                    icon={<Link className="h-8 w-8 text-[#6600cc]" />}
                    title="Blockchain"
                    description="Store signatures on blockchain for immutable verification"
                  />
                </div>

                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h3 className="text-lg font-semibold text-[#0066cc] mb-2">Why Use Digital Signatures?</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Prove the authenticity of a message or document</li>
                    <li>Ensure the message hasn't been tampered with</li>
                    <li>Provide non-repudiation (sender can't deny sending the message)</li>
                    <li>Create a permanent record of verification on the blockchain</li>
                    <li>Verify signatures on-the-go with the mobile companion app</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-4">
                <h2 className="text-2xl font-bold text-[#0066cc]">Key Features</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FeatureDetailCard
                    icon={<KeyRound className="h-6 w-6 text-[#00994c]" />}
                    title="RSA Key Generation"
                    description="Generate secure RSA key pairs for signing and verification"
                    details={[
                      "Cryptographically secure key generation",
                      "Visual strength indicator",
                      "Public and private key management",
                    ]}
                  />

                  <FeatureDetailCard
                    icon={<PenTool className="h-6 w-6 text-[#0066cc]" />}
                    title="Message Signing"
                    description="Sign messages with your private key"
                    details={["SHA-256 message hashing", "RSA signature generation", "Secure signing process"]}
                  />

                  <FeatureDetailCard
                    icon={<ShieldCheck className="h-6 w-6 text-[#ff9900]" />}
                    title="Signature Verification"
                    description="Verify signatures using the public key"
                    details={[
                      "Instant verification results",
                      "Detailed verification information",
                      "Multiple verification methods",
                    ]}
                  />

                  <FeatureDetailCard
                    icon={<BookOpen className="h-6 w-6 text-[#cc0033]" />}
                    title="Educational Tools"
                    description="Learn about RSA cryptography and digital signatures"
                    details={[
                      "Interactive signature visualization",
                      "Educational modal with detailed explanations",
                      "Step-by-step process visualization",
                    ]}
                  />

                  <FeatureDetailCard
                    icon={<Link className="h-6 w-6 text-[#6600cc]" />}
                    title="Blockchain Integration"
                    description="Store and verify signatures on the blockchain"
                    details={["Immutable signature storage", "Blockchain verification", "Transaction hash tracking"]}
                  />

                  <FeatureDetailCard
                    icon={<Smartphone className="h-6 w-6 text-[#0066cc]" />}
                    title="Mobile Companion"
                    description="Verify signatures on-the-go with the mobile app"
                    details={["QR code scanning", "Mobile-optimized interface", "Multiple verification methods"]}
                  />
                </div>
              </TabsContent>

              <TabsContent value="guide" className="space-y-4">
                <h2 className="text-2xl font-bold text-[#0066cc]">How to Use</h2>

                <div className="space-y-8">
                  <StepCard
                    number={1}
                    title="Generate RSA Keys"
                    description="Start by generating a new RSA key pair. This creates both a private key (for signing) and a public key (for verification)."
                    action="Click the 'Generate Keys' button to create a new key pair."
                  />

                  <StepCard
                    number={2}
                    title="Enter Your Message"
                    description="Type or paste the message you want to sign in the message text area."
                    action="Enter your message in the 'Message to Sign/Verify' field."
                  />

                  <StepCard
                    number={3}
                    title="Sign the Message"
                    description="Use your private key to create a digital signature for your message."
                    action="Click the 'Sign Message' button to generate the signature."
                  />

                  <StepCard
                    number={4}
                    title="Verify the Signature"
                    description="Verify that the signature is valid using the public key."
                    action="Click the 'Verify Signature' button to check if the signature is valid."
                  />

                  <StepCard
                    number={5}
                    title="Explore Additional Features"
                    description="Try out the visualization, QR code generation, and blockchain verification features."
                    action="Click on the different tabs to explore these features."
                  />
                </div>

                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h3 className="text-lg font-semibold text-[#ff9900] mb-2">Tips for Best Results</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Keep your private key secure and never share it</li>
                    <li>Use the 'Export Data' button to save your signature information</li>
                    <li>For important documents, consider storing the signature on the blockchain</li>
                    <li>Use the QR code feature to easily share verification information</li>
                    <li>Check out the educational section to learn more about how RSA signatures work</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="mobile" className="space-y-4">
                <h2 className="text-2xl font-bold text-[#0066cc]">Mobile Companion App</h2>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <p className="mb-4">
                      The RSA Digital Signature mobile companion app allows you to verify signatures on-the-go using
                      your mobile device. It's designed for quick and easy verification when you're away from your
                      computer.
                    </p>

                    <h3 className="text-lg font-semibold text-[#0066cc] mb-2">Key Mobile Features:</h3>
                    <ul className="list-disc pl-5 space-y-1 mb-4">
                      <li>QR code scanning for instant verification</li>
                      <li>Mobile-optimized interface</li>
                      <li>Blockchain verification support</li>
                      <li>Clipboard integration</li>
                      <li>Haptic feedback for verification results</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-[#0066cc] mb-2">How to Use the Mobile App:</h3>
                    <ol className="list-decimal pl-5 space-y-1 mb-4">
                      <li>Open the mobile app by clicking the "Mobile App" button</li>
                      <li>Choose your verification method (QR scan, manual, or blockchain)</li>
                      <li>Scan a QR code or enter signature details manually</li>
                      <li>View the verification results</li>
                    </ol>

                    <Button onClick={handleMobileApp} className="bg-[#0066cc] mt-4">
                      <Smartphone className="mr-2 h-4 w-4" />
                      Open Mobile App
                    </Button>
                  </div>

                  <div className="flex-1 flex justify-center">
                    <div className="border-8 border-black rounded-3xl overflow-hidden shadow-xl bg-white w-64">
                      <div className="h-6 bg-black"></div>
                      <div className="p-2">
                        <div className="bg-[#0066cc] text-white p-2 flex items-center">
                          <ArrowRight className="h-4 w-4 mr-2" />
                          <span className="font-bold">RSA Signature Verifier</span>
                        </div>
                        <div className="p-2 space-y-2">
                          <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                            <Camera className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-8 bg-[#00994c] rounded flex items-center justify-center text-white text-xs">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Verify Signature
                          </div>
                          <div className="h-16 bg-green-50 border border-green-200 rounded p-1">
                            <div className="flex items-center">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                              <div className="h-3 bg-green-100 rounded w-1/2"></div>
                            </div>
                            <div className="h-2 bg-green-100 rounded w-full mt-1"></div>
                            <div className="h-2 bg-green-100 rounded w-3/4 mt-1"></div>
                          </div>
                        </div>
                      </div>
                      <div className="h-6 bg-black flex justify-center items-center">
                        <div className="w-16 h-1 bg-white rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="bg-gray-50 p-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGetStarted} className="bg-[#0066cc] text-lg px-8 py-6">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" onClick={() => setActiveTab("guide")} className="text-[#0066cc] border-[#0066cc]">
              <BookOpen className="mr-2 h-5 w-5" />
              Read the Guide
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center text-center">
      <div className="mb-3">{icon}</div>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}

interface FeatureDetailCardProps {
  icon: React.ReactNode
  title: string
  description: string
  details: string[]
}

function FeatureDetailCard({ icon, title, description, details }: FeatureDetailCardProps) {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center mb-3">
        <div className="mr-3">{icon}</div>
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      <p className="text-gray-600 mb-3">{description}</p>
      <ul className="list-disc pl-5 space-y-1">
        {details.map((detail, index) => (
          <li key={index} className="text-sm text-gray-600">
            {detail}
          </li>
        ))}
      </ul>
    </div>
  )
}

interface StepCardProps {
  number: number
  title: string
  description: string
  action: string
}

function StepCard({ number, title, description, action }: StepCardProps) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-[#0066cc] text-white flex items-center justify-center font-bold text-lg">
          {number}
        </div>
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-lg mb-1">{title}</h3>
        <p className="text-gray-600 mb-2">{description}</p>
        <p className="text-sm bg-blue-50 p-2 rounded border-l-4 border-[#0066cc]">{action}</p>
      </div>
    </div>
  )
}

function Camera({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}
