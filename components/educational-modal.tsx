"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EducationalModalProps {
  onClose: () => void
}

export function EducationalModal({ onClose }: EducationalModalProps) {
  const [activeTab, setActiveTab] = useState("basics")

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Understanding RSA Digital Signatures</DialogTitle>
          <DialogDescription>
            Learn how RSA digital signatures work and why they're important for security
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basics" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="math">The Math</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="space-y-4">
            <h3 className="text-lg font-semibold">What is a Digital Signature?</h3>
            <p>
              A digital signature is the electronic equivalent of a handwritten signature or stamped seal, but offering
              far more security. It's a mathematical technique used to validate the authenticity and integrity of a
              message, software, or digital document.
            </p>

            <h3 className="text-lg font-semibold">How RSA Signatures Work</h3>
            <p>RSA signatures work using public key cryptography, which involves two keys:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Private Key:</strong> Known only to the owner and used to create signatures
              </li>
              <li>
                <strong>Public Key:</strong> Available to everyone and used to verify signatures
              </li>
            </ul>

            <h3 className="text-lg font-semibold">The Signature Process</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>The message is hashed using a secure hashing algorithm (like SHA-256)</li>
              <li>The hash is encrypted with the signer's private key to create the signature</li>
              <li>The original message and signature are sent to the recipient</li>
              <li>The recipient decrypts the signature using the sender's public key</li>
              <li>The recipient hashes the received message and compares it to the decrypted signature</li>
              <li>If they match, the signature is valid</li>
            </ol>
          </TabsContent>

          <TabsContent value="math" className="space-y-4">
            <h3 className="text-lg font-semibold">The Mathematics Behind RSA</h3>
            <p>
              RSA is based on the mathematical fact that finding the prime factors of a large composite number is hard
              (the factoring problem).
            </p>

            <h4 className="font-medium mt-4">Key Generation</h4>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Choose two large prime numbers, p and q</li>
              <li>Compute n = p × q</li>
              <li>Compute the totient: φ(n) = (p-1) × (q-1)</li>
              <li>Choose an integer e such that 1 &lt; e &lt; φ(n) and gcd(e, φ(n)) = 1</li>
              <li>Compute d such that d × e ≡ 1 (mod φ(n))</li>
            </ol>
            <p className="mt-2">The public key is (e, n) and the private key is (d, n).</p>

            <h4 className="font-medium mt-4">Signing</h4>
            <p>For a message m, the signature s is:</p>
            <div className="bg-gray-100 p-3 rounded font-mono">
              s = m<sup>d</sup> mod n
            </div>

            <h4 className="font-medium mt-4">Verification</h4>
            <p>To verify, compute:</p>
            <div className="bg-gray-100 p-3 rounded font-mono">
              m' = s<sup>e</sup> mod n
            </div>
            <p className="mt-2">If m' = m, the signature is valid.</p>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <h3 className="text-lg font-semibold">Security Considerations</h3>

            <h4 className="font-medium">Key Size</h4>
            <p>The security of RSA depends on the key size:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>1024 bits: No longer considered secure for sensitive information</li>
              <li>2048 bits: Currently standard for most applications</li>
              <li>4096 bits: Recommended for high-security applications</li>
            </ul>

            <h4 className="font-medium mt-4">Potential Attacks</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Factoring Attack:</strong> Attempting to factor n to find p and q
              </li>
              <li>
                <strong>Timing Attacks:</strong> Analyzing the time taken to perform private key operations
              </li>
              <li>
                <strong>Side-Channel Attacks:</strong> Exploiting information gained from the physical implementation
              </li>
            </ul>

            <h4 className="font-medium mt-4">Best Practices</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use secure random number generators for key generation</li>
              <li>Keep private keys securely stored and never share them</li>
              <li>Use padding schemes like PSS for additional security</li>
              <li>Regularly rotate keys for long-term security</li>
            </ul>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <h3 className="text-lg font-semibold">Real-World Applications</h3>

            <h4 className="font-medium">Document Signing</h4>
            <p>
              Digital signatures are used to sign PDF documents, contracts, and legal agreements, providing
              non-repudiation and verification of the signer's identity.
            </p>

            <h4 className="font-medium mt-4">Code Signing</h4>
            <p>
              Software developers sign their code to verify its authenticity and ensure it hasn't been tampered with
              since publication.
            </p>

            <h4 className="font-medium mt-4">Email Security</h4>
            <p>
              S/MIME and PGP use digital signatures to verify the sender's identity and ensure email content hasn't been
              altered.
            </p>

            <h4 className="font-medium mt-4">Blockchain and Cryptocurrencies</h4>
            <p>
              Digital signatures are fundamental to blockchain technology, allowing secure transactions and ownership
              verification without a central authority.
            </p>

            <h4 className="font-medium mt-4">SSL/TLS Certificates</h4>
            <p>
              Websites use certificates signed by trusted Certificate Authorities to establish secure HTTPS connections.
            </p>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
