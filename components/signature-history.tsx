"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Filter,
  Link,
  MoreVertical,
  PenTool,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react"
import {
  type SignatureHistoryEntry,
  getSignatureHistory,
  updateSignatureHistoryEntry,
  deleteSignatureHistoryEntry,
  clearSignatureHistory,
  exportSignatureHistory,
  importSignatureHistory,
  filterSignatureHistory,
} from "@/lib/history-service"

interface SignatureHistoryProps {
  onSelectSignature?: (data: {
    message: string
    signature: string
    publicKey?: { e: string; n: string }
  }) => void
}

export function SignatureHistory({ onSelectSignature }: SignatureHistoryProps) {
  const [history, setHistory] = useState<SignatureHistoryEntry[]>([])
  const [filteredHistory, setFilteredHistory] = useState<SignatureHistoryEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<SignatureHistoryEntry | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)
  const [importData, setImportData] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "created" | "verified" | "timestamped" | "blockchain">("all")
  const [filters, setFilters] = useState({
    type: [] as string[],
    isValid: undefined as boolean | undefined,
    dateFrom: "",
    dateTo: "",
    searchText: "",
  })
  const [editingNotes, setEditingNotes] = useState("")

  const itemsPerPage = 10

  // Load history on component mount
  useEffect(() => {
    loadHistory()
  }, [])

  // Apply filters when history or filters change
  useEffect(() => {
    applyFilters()
  }, [history, filters, searchText, activeTab])

  // Load history from storage
  const loadHistory = () => {
    const loadedHistory = getSignatureHistory()
    setHistory(loadedHistory)
  }

  // Apply filters to history
  const applyFilters = () => {
    let typeFilter: string[] = []

    // Set type filter based on active tab
    switch (activeTab) {
      case "created":
        typeFilter = ["creation"]
        break
      case "verified":
        typeFilter = ["verification"]
        break
      case "timestamped":
        typeFilter = ["timestamp"]
        break
      case "blockchain":
        typeFilter = ["blockchain"]
        break
      default:
        typeFilter = []
    }

    // Apply filters
    const filtered = filterSignatureHistory({
      type: typeFilter.length > 0 ? (typeFilter as any) : undefined,
      isValid: filters.isValid,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      searchText: searchText || filters.searchText,
    })

    setFilteredHistory(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Handle entry selection
  const handleSelectEntry = (entry: SignatureHistoryEntry) => {
    setSelectedEntry(entry)
    setEditingNotes(entry.notes || "")
    setShowDetailsDialog(true)
  }

  // Handle entry deletion
  const handleDeleteEntry = (id: string) => {
    if (deleteSignatureHistoryEntry(id)) {
      loadHistory()
      if (selectedEntry?.id === id) {
        setSelectedEntry(null)
        setShowDetailsDialog(false)
      }
    }
  }

  // Handle notes update
  const handleUpdateNotes = () => {
    if (!selectedEntry) return

    if (updateSignatureHistoryEntry(selectedEntry.id, { notes: editingNotes })) {
      loadHistory()
      setSelectedEntry({
        ...selectedEntry,
        notes: editingNotes,
      })
    }
  }

  // Handle export
  const handleExport = () => {
    const jsonData = exportSignatureHistory()
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "rsa-signature-history.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Handle import
  const handleImport = () => {
    if (importSignatureHistory(importData)) {
      loadHistory()
      setShowImportDialog(false)
      setImportData("")
    }
  }

  // Handle clear all
  const handleClearAll = () => {
    if (clearSignatureHistory()) {
      loadHistory()
      setShowDeleteConfirmDialog(false)
    }
  }

  // Handle use signature
  const handleUseSignature = () => {
    if (!selectedEntry || !onSelectSignature) return

    onSelectSignature({
      message: selectedEntry.message,
      signature: selectedEntry.signature,
      publicKey: selectedEntry.publicKey,
    })

    setShowDetailsDialog(false)
  }

  // Get paginated history
  const getPaginatedHistory = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredHistory.slice(startIndex, endIndex)
  }

  // Calculate total pages
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)

  // Get type icon
  const getTypeIcon = (type: SignatureHistoryEntry["type"]) => {
    switch (type) {
      case "creation":
        return <PenTool className="h-4 w-4 text-[#0066cc]" />
      case "verification":
        return <ShieldCheck className="h-4 w-4 text-[#ff9900]" />
      case "timestamp":
        return <Clock className="h-4 w-4 text-[#00994c]" />
      case "blockchain":
        return <Link className="h-4 w-4 text-[#6600cc]" />
    }
  }

  // Get type label
  const getTypeLabel = (type: SignatureHistoryEntry["type"]) => {
    switch (type) {
      case "creation":
        return "Created"
      case "verification":
        return "Verified"
      case "timestamp":
        return "Timestamped"
      case "blockchain":
        return "Blockchain"
    }
  }

  // Get result badge
  const getResultBadge = (entry: SignatureHistoryEntry) => {
    if (!entry.result) return null

    return entry.result.isValid ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
        <CheckCircle className="h-3 w-3 mr-1" /> Valid
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
        <XCircle className="h-3 w-3 mr-1" /> Invalid
      </Badge>
    )
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Truncate text
  const truncateText = (text: string, maxLength = 30) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Signature History</CardTitle>
            <CardDescription>Track and manage your signature activities</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilterDialog(true)}>
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export History
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowImportDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import History
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDeleteConfirmDialog(true)} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All History
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and filter bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search signatures..."
                className="pl-8"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="created">Created</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="timestamped">Timestamped</TabsTrigger>
              <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* History table */}
          {filteredHistory.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="w-[180px]">Date</TableHead>
                    <TableHead className="w-[100px]">Result</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPaginatedHistory().map((entry) => (
                    <TableRow
                      key={entry.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => handleSelectEntry(entry)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getTypeIcon(entry.type)}
                          <span className="text-xs">{getTypeLabel(entry.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{truncateText(entry.message)}</TableCell>
                      <TableCell className="text-xs">{formatDate(entry.timestamp)}</TableCell>
                      <TableCell>{getResultBadge(entry)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectEntry(entry)
                          }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-md">
              <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500">No signature history found</p>
              <p className="text-gray-400 text-sm">Sign or verify messages to start building your history</p>
            </div>
          )}

          {/* Pagination */}
          {filteredHistory.length > itemsPerPage && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum = currentPage - 2 + i
                  if (pageNum < 1) pageNum += Math.min(5, totalPages)
                  if (pageNum > totalPages) pageNum -= Math.min(5, totalPages)

                  return pageNum > 0 && pageNum <= totalPages ? (
                    <PaginationItem key={pageNum}>
                      <PaginationLink isActive={currentPage === pageNum} onClick={() => setCurrentPage(pageNum)}>
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ) : null
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>

        {/* Entry details dialog */}
        {selectedEntry && (
          <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Signature Details</DialogTitle>
                <DialogDescription>
                  {getTypeLabel(selectedEntry.type)} on {formatDate(selectedEntry.timestamp)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {getTypeIcon(selectedEntry.type)}
                  <span className="font-medium">{getTypeLabel(selectedEntry.type)}</span>
                  {getResultBadge(selectedEntry)}
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message:</label>
                    <div className="p-2 bg-slate-50 rounded border font-mono text-xs overflow-auto max-h-32">
                      {selectedEntry.message}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Signature:</label>
                    <div className="p-2 bg-slate-50 rounded border font-mono text-xs overflow-auto max-h-32">
                      {selectedEntry.signature}
                    </div>
                  </div>
                </div>

                {selectedEntry.publicKey && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Public Key:</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="p-2 bg-slate-50 rounded border font-mono text-xs">
                        <span className="font-medium">e: </span>
                        {selectedEntry.publicKey.e}
                      </div>
                      <div className="p-2 bg-slate-50 rounded border font-mono text-xs overflow-auto max-h-20">
                        <span className="font-medium">n: </span>
                        {selectedEntry.publicKey.n}
                      </div>
                    </div>
                  </div>
                )}

                {selectedEntry.result?.details && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Result Details:</label>
                    <div className="p-2 bg-slate-50 rounded border text-xs">{selectedEntry.result.details}</div>
                  </div>
                )}

                {selectedEntry.timestampToken && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Timestamp Information:</label>
                    <div className="p-2 bg-slate-50 rounded border text-xs">
                      <div>
                        <span className="font-medium">Time: </span>
                        {formatDate(selectedEntry.timestampToken.timestamp)}
                      </div>
                      <div>
                        <span className="font-medium">Authority: </span>
                        {selectedEntry.timestampToken.tsaName}
                      </div>
                      <div>
                        <span className="font-medium">Serial: </span>
                        {selectedEntry.timestampToken.serialNumber}
                      </div>
                    </div>
                  </div>
                )}

                {selectedEntry.blockchainTxHash && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Blockchain Transaction:</label>
                    <div className="p-2 bg-slate-50 rounded border font-mono text-xs">
                      {selectedEntry.blockchainTxHash}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes:</label>
                  <Textarea
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    placeholder="Add notes about this signature..."
                    className="min-h-[80px]"
                  />
                  <Button size="sm" onClick={handleUpdateNotes} className="w-full">
                    Save Notes
                  </Button>
                </div>
              </div>

              <DialogFooter className="flex justify-between">
                <Button variant="destructive" size="sm" onClick={() => handleDeleteEntry(selectedEntry.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>

                <div className="flex gap-2">
                  {onSelectSignature && (
                    <Button onClick={handleUseSignature} className="bg-[#0066cc]">
                      Use This Signature
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                    Close
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Filter dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter History</DialogTitle>
              <DialogDescription>Set filters to narrow down your signature history</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type:</label>
                <div className="flex flex-wrap gap-2">
                  {["creation", "verification", "timestamp", "blockchain"].map((type) => (
                    <Badge
                      key={type}
                      variant={filters.type.includes(type) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setFilters({
                          ...filters,
                          type: filters.type.includes(type)
                            ? filters.type.filter((t) => t !== type)
                            : [...filters.type, type],
                        })
                      }}
                    >
                      {type === "creation" && <PenTool className="h-3 w-3 mr-1" />}
                      {type === "verification" && <ShieldCheck className="h-3 w-3 mr-1" />}
                      {type === "timestamp" && <Clock className="h-3 w-3 mr-1" />}
                      {type === "blockchain" && <Link className="h-3 w-3 mr-1" />}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Result:</label>
                <div className="flex gap-2">
                  <Badge
                    variant={filters.isValid === true ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setFilters({
                        ...filters,
                        isValid: filters.isValid === true ? undefined : true,
                      })
                    }}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Valid
                  </Badge>
                  <Badge
                    variant={filters.isValid === false ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setFilters({
                        ...filters,
                        isValid: filters.isValid === false ? undefined : false,
                      })
                    }}
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Invalid
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From Date:</label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">To Date:</label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Search Text:</label>
                <Input
                  placeholder="Search in messages, signatures, and notes"
                  value={filters.searchText}
                  onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    type: [],
                    isValid: undefined,
                    dateFrom: "",
                    dateTo: "",
                    searchText: "",
                  })
                }}
              >
                Reset Filters
              </Button>
              <Button onClick={() => setShowFilterDialog(false)}>Apply Filters</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import History</DialogTitle>
              <DialogDescription>Paste your exported history JSON data below</DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder='[{"id": "...", "type": "creation", ...}]'
                className="min-h-[200px] font-mono text-xs"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!importData}>
                Import
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation dialog */}
        <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear All History</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete all signature history? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirmDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleClearAll}>
                Delete All History
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
