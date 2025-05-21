import { createHash } from "crypto"
import { BigInteger } from "jsbn"

// Generate RSA keys
export async function generateRSAKeys() {
  // For web demo purposes, we'll use smaller key sizes than production
  const e = new BigInteger("65537") // Common public exponent

  // Generate two random prime numbers
  const p = await generateLargePrime(256)
  const q = await generateLargePrime(256)

  // Calculate n = p * q
  const n = p.multiply(q)

  // Calculate phi(n) = (p-1) * (q-1)
  const p1 = p.subtract(BigInteger.ONE)
  const q1 = q.subtract(BigInteger.ONE)
  const phi = p1.multiply(q1)

  // Calculate private key d = e^-1 mod phi
  const d = e.modInverse(phi)

  return {
    e: e.toString(),
    n: n.toString(),
    d: d.toString(),
  }
}

// Sign a message using RSA
export async function signMessage(message: string, dStr: string, nStr: string) {
  // Create hash of the message
  const hash = createSHA256Hash(message)
  const hashInt = new BigInteger(hash, 16)

  // Convert string keys to BigInteger
  const d = new BigInteger(dStr)
  const n = new BigInteger(nStr)

  // Sign: signature = hash^d mod n
  const signature = hashInt.modPow(d, n)

  return {
    signature: signature.toString(),
    hash: hashInt.toString(16),
  }
}

// Verify a signature
export async function verifySignature(message: string, signatureStr: string, eStr: string, nStr: string) {
  // Create hash of the message
  const hash = createSHA256Hash(message)
  const hashInt = new BigInteger(hash, 16)

  // Convert string keys to BigInteger
  const e = new BigInteger(eStr)
  const n = new BigInteger(nStr)
  const signature = new BigInteger(signatureStr)

  // Verify: decrypted = signature^e mod n
  const decrypted = signature.modPow(e, n)

  return {
    isValid: hashInt.equals(decrypted),
    hash: hashInt.toString(16),
    decrypted: decrypted.toString(16),
  }
}

// Helper function to create SHA-256 hash
function createSHA256Hash(message: string): string {
  return createHash("sha256").update(message).digest("hex")
}

// Helper function to generate a large prime number
async function generateLargePrime(bits: number): Promise<BigInteger> {
  // For demo purposes, we'll use a simpler approach
  // In production, you'd want a more robust prime generation algorithm

  // Start with a random odd number of the specified bit length
  let candidate = generateRandomBigInt(bits)
  if (candidate.testBit(0) === false) {
    candidate = candidate.add(BigInteger.ONE)
  }

  // Keep incrementing by 2 until we find a prime
  while (!isProbablePrime(candidate, 10)) {
    candidate = candidate.add(new BigInteger("2"))
  }

  return candidate
}

// Generate a random BigInteger of specified bit length
function generateRandomBigInt(bits: number): BigInteger {
  const bytes = Math.ceil(bits / 8)
  const array = new Uint8Array(bytes)

  // Generate random bytes
  crypto.getRandomValues(array)

  // Ensure the number has the specified bit length
  array[0] |= 0x80

  // Convert to hex string
  let hex = ""
  for (let i = 0; i < array.length; i++) {
    hex += ("0" + array[i].toString(16)).slice(-2)
  }

  return new BigInteger(hex, 16)
}

// Miller-Rabin primality test
function isProbablePrime(n: BigInteger, k: number): boolean {
  // Handle small numbers
  if (n.equals(BigInteger.ONE) || n.equals(BigInteger.ZERO)) return false
  if (n.equals(new BigInteger("2")) || n.equals(new BigInteger("3"))) return true
  if (n.mod(new BigInteger("2")).equals(BigInteger.ZERO)) return false

  // Write n-1 as 2^r * d
  let d = n.subtract(BigInteger.ONE)
  let r = 0

  while (d.mod(new BigInteger("2")).equals(BigInteger.ZERO)) {
    d = d.divide(new BigInteger("2"))
    r++
  }

  // Witness loop
  witnessLoop: for (let i = 0; i < k; i++) {
    // Generate random a in the range [2, n-2]
    const a = getRandomBigIntInRange(new BigInteger("2"), n.subtract(new BigInteger("2")))

    // Compute x = a^d mod n
    let x = a.modPow(d, n)

    if (x.equals(BigInteger.ONE) || x.equals(n.subtract(BigInteger.ONE))) {
      continue
    }

    for (let j = 0; j < r - 1; j++) {
      x = x.modPow(new BigInteger("2"), n)
      if (x.equals(n.subtract(BigInteger.ONE))) {
        continue witnessLoop
      }
    }

    return false
  }

  return true
}

// Get a random BigInteger in range [min, max]
function getRandomBigIntInRange(min: BigInteger, max: BigInteger): BigInteger {
  const range = max.subtract(min).add(BigInteger.ONE)
  const bits = range.bitLength()
  let result

  do {
    result = generateRandomBigInt(bits)
  } while (result.compareTo(range) >= 0)

  return result.add(min)
}
