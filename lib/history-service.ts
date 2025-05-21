// Types for signature history
export interface SignatureHistoryEntry {
  id: string
  type: "creation" | "verification" | "timestamp" | "blockchain"
  timestamp: string
  message: string
  signature: string
  publicKey?: {
    e: string
    n: string
  }
  result?: {
    isValid: boolean
    details?: string
  }
  timestampToken?: any
  blockchainTxHash?: string
  tags?: string[]
  notes?: string
}

// Storage key for localStorage
const HISTORY_STORAGE_KEY = "rsa-signature-history"

/**
 * Get all signature history entries
 */
export function getSignatureHistory(): SignatureHistoryEntry[] {
  try {
    const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!storedHistory) return []

    return JSON.parse(storedHistory) as SignatureHistoryEntry[]
  } catch (error) {
    console.error("Failed to load signature history:", error)
    return []
  }
}

/**
 * Add a new entry to the signature history
 */
export function addSignatureHistoryEntry(
  entry: Omit<SignatureHistoryEntry, "id" | "timestamp">,
): SignatureHistoryEntry {
  try {
    const history = getSignatureHistory()

    // Create a new entry with ID and timestamp
    const newEntry: SignatureHistoryEntry = {
      ...entry,
      id: generateId(),
      timestamp: new Date().toISOString(),
    }

    // Add to history and save
    history.unshift(newEntry) // Add to beginning of array
    saveSignatureHistory(history)

    return newEntry
  } catch (error) {
    console.error("Failed to add signature history entry:", error)
    throw error
  }
}

/**
 * Update an existing history entry
 */
export function updateSignatureHistoryEntry(id: string, updates: Partial<SignatureHistoryEntry>): boolean {
  try {
    const history = getSignatureHistory()
    const index = history.findIndex((entry) => entry.id === id)

    if (index === -1) return false

    // Update the entry
    history[index] = {
      ...history[index],
      ...updates,
    }

    saveSignatureHistory(history)
    return true
  } catch (error) {
    console.error("Failed to update signature history entry:", error)
    return false
  }
}

/**
 * Delete a history entry
 */
export function deleteSignatureHistoryEntry(id: string): boolean {
  try {
    const history = getSignatureHistory()
    const filteredHistory = history.filter((entry) => entry.id !== id)

    if (filteredHistory.length === history.length) return false

    saveSignatureHistory(filteredHistory)
    return true
  } catch (error) {
    console.error("Failed to delete signature history entry:", error)
    return false
  }
}

/**
 * Clear all history
 */
export function clearSignatureHistory(): boolean {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY)
    return true
  } catch (error) {
    console.error("Failed to clear signature history:", error)
    return false
  }
}

/**
 * Export history as JSON
 */
export function exportSignatureHistory(): string {
  const history = getSignatureHistory()
  return JSON.stringify(history, null, 2)
}

/**
 * Import history from JSON
 */
export function importSignatureHistory(jsonData: string): boolean {
  try {
    const importedHistory = JSON.parse(jsonData) as SignatureHistoryEntry[]

    // Validate the imported data
    if (!Array.isArray(importedHistory)) {
      throw new Error("Invalid history data format")
    }

    // Save the imported history
    saveSignatureHistory(importedHistory)
    return true
  } catch (error) {
    console.error("Failed to import signature history:", error)
    return false
  }
}

/**
 * Filter history by various criteria
 */
export function filterSignatureHistory(filters: {
  type?: SignatureHistoryEntry["type"] | SignatureHistoryEntry["type"][]
  isValid?: boolean
  dateFrom?: string
  dateTo?: string
  searchText?: string
  tags?: string[]
}): SignatureHistoryEntry[] {
  const history = getSignatureHistory()

  return history.filter((entry) => {
    // Filter by type
    if (filters.type) {
      if (Array.isArray(filters.type)) {
        if (!filters.type.includes(entry.type)) return false
      } else if (entry.type !== filters.type) {
        return false
      }
    }

    // Filter by validity
    if (filters.isValid !== undefined && entry.result) {
      if (entry.result.isValid !== filters.isValid) return false
    }

    // Filter by date range
    if (filters.dateFrom) {
      if (new Date(entry.timestamp) < new Date(filters.dateFrom)) return false
    }

    if (filters.dateTo) {
      if (new Date(entry.timestamp) > new Date(filters.dateTo)) return false
    }

    // Filter by search text
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase()
      const messageMatch = entry.message.toLowerCase().includes(searchLower)
      const signatureMatch = entry.signature.toLowerCase().includes(searchLower)
      const notesMatch = entry.notes ? entry.notes.toLowerCase().includes(searchLower) : false

      if (!messageMatch && !signatureMatch && !notesMatch) return false
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0 && entry.tags) {
      if (!filters.tags.some((tag) => entry.tags?.includes(tag))) return false
    }

    return true
  })
}

// Helper function to save history to localStorage
function saveSignatureHistory(history: SignatureHistoryEntry[]): void {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
}

// Helper function to generate a unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}
