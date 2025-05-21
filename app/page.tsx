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

export default function LandingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  const handleGetStarted = () => {
    router.push("/app")
  }

  const handleMobileApp = () => {
    router.push("/mobile")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f0f0] to-white">
      <header className="bg-[#0066cc] text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <FileDigit className="mr-2 h-6 w-6" />
            RSA Digital Signature
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMobileApp}
              className="text-white border-white hover:bg-white/20 hover:text-white"
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Mobile App
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#0066cc] to-[#0055aa] text-white text-center py-12">
            <CardTitle className="text-4xl font-bold mb-4">Welcome to RSA Digital Signature</CardTitle>
            <CardDescription className="text-white/90 text-xl">
              Secure, verify, and visualize digital signatures with advanced cryptography
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <div className="flex justify-center mb-12">
              <div className="w-28 h-28 rounded-full bg-[#0066cc] flex items-center justify-center">
                <FileDigit className="h-14 w-14 text-white" />
              </div>
            </div>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="guide">How To Use</TabsTrigger>
                <TabsTrigger value="mobile">Mobile App</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0066cc]">What is RSA Digital Signature?</h2>
                <p className="text-lg">
                  RSA Digital Signature is a powerful tool that allows you to create and verify digital signatures using
                  the RSA cryptographic algorithm. Digital signatures provide authentication, non-repudiation, and
                  integrity verification for your digital messages and documents.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <FeatureCard
                    icon={<ShieldCheck className="h-10 w-10 text-[#00994c]" />}
                    title="Security"
                    description="Cryptographically secure signatures that can't be forged without the private key"
                  />
                  <FeatureCard
                    icon={<CheckCircle className="h-10 w-10 text-[#ff9900]" />}
                    title="Verification"
                    description="Easily verify the authenticity and integrity of signed messages"
                  />
                  <FeatureCard
                    icon={<Link className="h-10 w-10 text-[#6600cc]" />}
                    title="Blockchain"
                    description="Store signatures on blockchain for immutable verification"
                  />
                </div>

                <div className="mt-10 p-6 bg-blue-50 border border-blue-200 rounded-md">
                  <h3 className="text-xl font-semibold text-[#0066cc] mb-3">Why Use Digital Signatures?</h3>
                  <ul className="list-disc pl-6 space-y-2 text-lg">
                    <li>Prove the authenticity of a message or document</li>
                    <li>Ensure the message hasn't been tampered with</li>
                    <li>Provide non-repudiation (sender can't deny sending the message)</li>
                    <li>Create a permanent record of verification on the blockchain</li>
                    <li>Verify signatures on-the-go with the mobile companion app</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0066cc]">Key Features</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FeatureDetailCard
                    icon={<KeyRound className="h-8 w-8 text-[#00994c]" />}
                    title="RSA Key Generation"
                    description="Generate secure RSA key pairs for signing and verification"
                    details={[
                      "Cryptographically secure key generation",
                      "Visual strength indicator",
                      "Public and private key management",
                    ]}
                  />

                  <FeatureDetailCard
                    icon={<PenTool className="h-8 w-8 text-[#0066cc]" />}
                    title="Message Signing"
                    description="Sign messages with your private key"
                    details={["SHA-256 message hashing", "RSA signature generation", "Secure signing process"]}
                  />

                  <FeatureDetailCard
                    icon={<ShieldCheck className="h-8 w-8 text-[#ff9900]" />}
                    title="Signature Verification"
                    description="Verify signatures using the public key"
                    details={[
                      "Instant verification results",
                      "Detailed verification information",
                      "Multiple verification methods",
                    ]}
                  />

                  <FeatureDetailCard
                    icon={<BookOpen className="h-8 w-8 text-[#cc0033]" />}
                    title="Educational Tools"
                    description="Learn about RSA cryptography and digital signatures"
                    details={[
                      "Interactive signature visualization",
                      "Educational modal with detailed explanations",
                      "Step-by-step process visualization",
                    ]}
                  />

                  <FeatureDetailCard
                    icon={<Link className="h-8 w-8 text-[#6600cc]" />}
                    title="Blockchain Integration"
                    description="Store and verify signatures on the blockchain"
                    details={["Immutable signature storage", "Blockchain verification", "Transaction hash tracking"]}
                  />

                  <FeatureDetailCard
                    icon={<Smartphone className="h-8 w-8 text-[#0066cc]" />}
                    title="Mobile Companion"
                    description="Verify signatures on-the-go with the mobile app"
                    details={["QR code scanning", "Mobile-optimized interface", "Multiple verification methods"]}
                  />
                </div>
              </TabsContent>

              <TabsContent value="guide" className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0066cc]">How to Use</h2>

                <div className="space-y-10">
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

                <div className="mt-10 p-6 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h3 className="text-xl font-semibold text-[#ff9900] mb-3">Tips for Best Results</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Keep your private key secure and never share it</li>
                    <li>Use the 'Export Data' button to save your signature information</li>
                    <li>For important documents, consider storing the signature on the blockchain</li>
                    <li>Use the QR code feature to easily share verification information</li>
                    <li>Check out the educational section to learn more about how RSA signatures work</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="mobile" className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0066cc]">Mobile Companion App</h2>

                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <p className="text-lg mb-6">
                      The RSA Digital Signature mobile companion app allows you to verify signatures on-the-go using
                      your mobile device. It's designed for quick and easy verification when you're away from your
                      computer.
                    </p>

                    <h3 className="text-xl font-semibold text-[#0066cc] mb-3">Key Mobile Features:</h3>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                      <li>QR code scanning for instant verification</li>
                      <li>Mobile-optimized interface</li>
                      <li>Blockchain verification support</li>
                      <li>Clipboard integration</li>
                      <li>Haptic feedback for verification results</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-[#0066cc] mb-3">How to Use the Mobile App:</h3>
                    <ol className="list-decimal pl-6 space-y-2 mb-6">
                      <li>Open the mobile app by clicking the "Mobile App" button</li>
                      <li>Choose your verification method (QR scan, manual, or blockchain)</li>
                      <li>Scan a QR code or enter signature details manually</li>
                      <li>View the verification results</li>
                    </ol>

                    <Button onClick={handleMobileApp} className="bg-[#0066cc] mt-6 text-lg px-6 py-2">
                      <Smartphone className="mr-2 h-5 w-5" />
                      Open Mobile App
                    </Button>
                  </div>

                  <div className="flex-1 flex justify-center">
                    <div className="border-8 border-black rounded-3xl overflow-hidden shadow-xl bg-white w-72">
                      <div className="h-6 bg-black"></div>
                      <div className="p-3">
                        <div className="bg-[#0066cc] text-white p-3 flex items-center">
                          <ArrowRight className="h-5 w-5 mr-2" />
                          <span className="font-bold">RSA Signature Verifier</span>
                        </div>
                        <div className="p-3 space-y-3">
                          <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
                            <Camera className="h-10 w-10 text-gray-400" />
                          </div>
                          <div className="h-5 bg-gray-200 rounded w-full"></div>
                          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-10 bg-[#00994c] rounded flex items-center justify-center text-white">
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Verify Signature
                          </div>
                          <div className="h-20 bg-green-50 border border-green-200 rounded p-2">
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              <div className="h-4 bg-green-100 rounded w-1/2"></div>
                            </div>
                            <div className="h-3 bg-green-100 rounded w-full mt-2"></div>
                            <div className="h-3 bg-green-100 rounded w-3/4 mt-2"></div>
                          </div>
                        </div>
                      </div>
                      <div className="h-6 bg-black flex justify-center items-center">
                        <div className="w-20 h-1 bg-white rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="bg-gray-50 p-8 flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              onClick={handleGetStarted}
              className="bg-[#0066cc] text-xl px-10 py-7 shadow-lg hover:shadow-xl transition-all"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveTab("guide")}
              className="text-[#0066cc] border-[#0066cc] text-lg"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Read the Guide
            </Button>
          </CardFooter>
        </Card>
      </main>

      <footer className="bg-gray-100 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>RSA Digital Signature Application</p>
          <p className="text-sm mt-2">Secure, verify, and visualize digital signatures with advanced cryptography</p>
        </div>
      </footer>
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
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="font-bold text-xl mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
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
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <div className="flex items-center mb-4">
        <div className="mr-4">{icon}</div>
        <h3 className="font-bold text-xl">{title}</h3>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <ul className="list-disc pl-6 space-y-2">
        {details.map((detail, index) => (
          <li key={index} className="text-gray-600">
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
    <div className="flex gap-6">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-[#0066cc] text-white flex items-center justify-center font-bold text-xl">
          {number}
        </div>
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-xl mb-2">{title}</h3>
        <p className="text-gray-600 mb-3 text-lg">{description}</p>
        <p className="text-lg bg-blue-50 p-3 rounded border-l-4 border-[#0066cc]">{action}</p>
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
