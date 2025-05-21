// This is a simulated blockchain service for demonstration purposes
// In a real application, this would connect to an actual blockchain network

interface SignatureData {
  message: string
  signature: string
  publicKey: {
    e: string
    n: string
  }
}

interface BlockchainStoreResult {
  transactionHash: string
  blockNumber: number
  timestamp: string
  blockExplorerUrl: string
}

interface BlockchainVerifyResult {
  isValid: boolean
  message: string
  signature: string
  publicKey: {
    e: string
    n: string
  }
  timestamp: string
  blockExplorerUrl: string
}

// Simulated blockchain storage
const blockchainStorage = new Map<string, SignatureData & { timestamp: string }>()

// Generate a random transaction hash
function generateTransactionHash(): string {
  const chars = "0123456789abcdef"
  let hash = "0x"
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)]
  }
  return hash
}

// Store a signature on the blockchain
export async function storeSignatureOnBlockchain(data: SignatureData): Promise<BlockchainStoreResult> {
  // Simulate blockchain transaction delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Generate a transaction hash
  const transactionHash = generateTransactionHash()

  // Generate a random block number
  const blockNumber = Math.floor(Math.random() * 1000000) + 15000000

  // Store the data with timestamp
  const timestamp = new Date().toISOString()
  blockchainStorage.set(transactionHash, {
    ...data,
    timestamp,
  })

  // Return transaction details
  return {
    transactionHash,
    blockNumber,
    timestamp,
    blockExplorerUrl: `https://etherscan.io/tx/${transactionHash}`,
  }
}

// Verify a signature from the blockchain
export async function verifySignatureOnBlockchain(transactionHash: string): Promise<BlockchainVerifyResult> {
  // Simulate blockchain query delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Check if the transaction exists
  const storedData = blockchainStorage.get(transactionHash)

  if (!storedData) {
    // For demo purposes, if the hash isn't found in our local storage,
    // we'll simulate a 50/50 chance of finding it on the "blockchain"
    if (Math.random() > 0.5) {
      throw new Error("Transaction not found on the blockchain")
    }

    // Simulate a found transaction with random data
    const mockTimestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    return {
      isValid: Math.random() > 0.3, // 70% chance of being valid
      message: "This is a simulated message from the blockchain",
      signature: "1234567890abcdef",
      publicKey: {
        e: "65537",
        n: "9876543210",
      },
      timestamp: mockTimestamp,
      blockExplorerUrl: `https://etherscan.io/tx/${transactionHash}`,
    }
  }

  // Return the stored data
  return {
    isValid: true,
    message: storedData.message,
    signature: storedData.signature,
    publicKey: storedData.publicKey,
    timestamp: storedData.timestamp,
    blockExplorerUrl: `https://etherscan.io/tx/${transactionHash}`,
  }
}
