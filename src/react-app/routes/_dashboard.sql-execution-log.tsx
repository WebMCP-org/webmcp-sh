import { createFileRoute } from '@tanstack/react-router'
import { pg_lite } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollTextIcon, Bot, User, Trash2, Sparkles, Clock, Copy, Database, CheckCircle2, XCircle, Code2, FileJson } from 'lucide-react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import type { SQLExecutionLog } from '@/lib/db/schema'
import { useState, useEffect, useMemo } from 'react'
import { highlightSQL, formatSQL } from '@/lib/syntax-highlight'
import { toast } from 'sonner'
import JsonView from '@uiw/react-json-view'
import { githubLightTheme } from '@uiw/react-json-view/githubLight'
import { cn } from '@/lib/utils'
import { useMCPSQLTool } from '@/hooks/useMCPSQLTool'

export const Route = createFileRoute('/_dashboard/sql-execution-log')({
  component: SQLExecutionLogPage,
})

// Helper function to escape HTML
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

function SQLExecutionLogPage() {
  const [selectedQuery, setSelectedQuery] = useState<SQLExecutionLog | null>(null)
  const [highlightedSQL, setHighlightedSQL] = useState<string>('')
  const [isFormatting, setIsFormatting] = useState(false)
  const [isFormatted, setIsFormatted] = useState(false)
  const [formattedQuery, setFormattedQuery] = useState<string>('')

  // Register SQL MCP tools for this page
  useMCPSQLTool()

  // Query execution logs from database
  const logsResult = useLiveQuery<SQLExecutionLog>(`
    SELECT * FROM sql_execution_log
    ORDER BY executed_at DESC
    LIMIT 100
  `)

  const queryHistory = logsResult?.rows ?? []

  const clearHistory = async () => {
    await pg_lite.query('DELETE FROM sql_execution_log')
    setSelectedQuery(null)
    toast.success('Query history cleared')
  }

  // Format SQL with Prettier
  const handleFormatSQL = async () => {
    if (!selectedQuery?.query) return

    // If already formatted, toggle back to original
    if (isFormatted) {
      // Don't format when going back to original - pass false
      const highlighted = await highlightSQL(selectedQuery.query, false)
      setHighlightedSQL(highlighted)
      setIsFormatted(false)
      setFormattedQuery('')
      toast.success('Showing original SQL')
      return
    }

    setIsFormatting(true)
    try {
      const formatted = await formatSQL(selectedQuery.query)
      // Already formatted, so don't format again - pass false
      const highlighted = await highlightSQL(formatted, false)
      setHighlightedSQL(highlighted)
      setFormattedQuery(formatted)
      setIsFormatted(true)
      toast.success('SQL formatted!')
    } catch (error) {
      console.error('Failed to format SQL:', error)
      toast.error('Failed to format SQL')
    } finally {
      setIsFormatting(false)
    }
  }

  // Copy SQL to clipboard (formatted if available, otherwise raw)
  const handleCopySQL = async () => {
    if (!selectedQuery?.query) return

    try {
      const textToCopy = isFormatted && formattedQuery ? formattedQuery : selectedQuery.query
      await navigator.clipboard.writeText(textToCopy)
      toast.success(`${isFormatted ? 'Formatted' : 'Original'} SQL copied to clipboard!`)
    } catch (error) {
      console.error('Failed to copy SQL:', error)
      toast.error('Failed to copy SQL')
    }
  }

  // Auto-select first query when list loads
  useEffect(() => {
    if (queryHistory.length > 0 && !selectedQuery) {
      setSelectedQuery(queryHistory[0])
    }
  }, [queryHistory, selectedQuery])

  // Highlight SQL when selected query changes
  useEffect(() => {
    if (selectedQuery?.query) {
      // Reset formatting state when switching queries
      setIsFormatted(false)
      setFormattedQuery('')

      // Don't format when highlighting - pass false to shouldFormat parameter
      highlightSQL(selectedQuery.query, false).then(setHighlightedSQL).catch((error) => {
        console.error('Failed to highlight SQL:', error)
        setHighlightedSQL(`<pre>${selectedQuery.query}</pre>`)
      })
    } else {
      setHighlightedSQL('')
      setIsFormatted(false)
      setFormattedQuery('')
    }
  }, [selectedQuery])

  // Parse result data for display
  const parsedResultData = useMemo(() => {
    if (!selectedQuery?.result_data) return null

    try {
      if (typeof selectedQuery.result_data === 'object' &&
          'rows' in selectedQuery.result_data &&
          Array.isArray(selectedQuery.result_data.rows)) {
        return selectedQuery.result_data.rows
      }
      return selectedQuery.result_data
    } catch {
      return null
    }
  }, [selectedQuery])

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-zinc-50 to-zinc-100">
      {/* Header */}
      <div className="flex-shrink-0 border-b backdrop-blur-xl bg-white/70 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl border border-blue-200">
                <ScrollTextIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-zinc-900">
                  SQL Execution Log
                </h1>
                <p className="text-sm text-zinc-600">View all AI and manual SQL query executions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="glass" className="font-mono">
                <Database className="h-3 w-3 mr-1" />
                {queryHistory.length} queries
              </Badge>
              {queryHistory.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearHistory}>
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Clear History
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar - Query List (Wider and properly scrollable) */}
        <div className="w-80 flex-shrink-0 border-r bg-white/50 flex flex-col min-h-0">
          <div className="flex-shrink-0 p-3 border-b bg-white/70 backdrop-blur">
            <h2 className="font-medium text-sm text-zinc-900">Recent Queries</h2>
          </div>

          {queryHistory.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="p-3 bg-gradient-to-br from-zinc-100 to-zinc-50 rounded-xl mb-2">
                <ScrollTextIcon className="h-6 w-6 text-zinc-400" />
              </div>
              <div className="text-xs font-medium text-zinc-600">No queries yet</div>
              <div className="text-xs text-zinc-500 mt-0.5">Queries will appear here</div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="p-1.5">
                {queryHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedQuery(item)}
                    className={cn(
                      "w-full text-left p-2.5 rounded-lg mb-1 transition-all duration-200 border",
                      selectedQuery?.id === item.id
                        ? 'bg-gradient-to-br from-blue-50 to-blue-100/70 border-blue-200 shadow-sm'
                        : 'bg-white/70 hover:bg-white border-transparent hover:border-zinc-200'
                    )}
                  >
                    {/* First Row: Source and Status */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        {item.source === 'ai' ? (
                          <Bot className="h-3 w-3 text-blue-600" />
                        ) : (
                          <User className="h-3 w-3 text-zinc-600" />
                        )}
                        <span className="text-[11px] font-medium text-zinc-700">
                          {item.source === 'ai' ? 'AI Generated' : 'Manual'}
                        </span>
                        {item.execution_time_ms && (
                          <span className="text-[10px] text-zinc-500">
                            • {item.execution_time_ms}ms
                          </span>
                        )}
                      </div>
                      {item.success ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-600 flex-shrink-0" />
                      )}
                    </div>

                    {/* Second Row: Query Preview */}
                    <div className="text-[11px] font-mono text-zinc-600 line-clamp-2 mb-1">
                      {item.query}
                    </div>

                    {/* Third Row: Time */}
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(item.executed_at).toLocaleTimeString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        {!selectedQuery ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="p-5 bg-gradient-to-br from-zinc-100 to-zinc-50 rounded-3xl mb-4 inline-block">
                <Database className="h-12 w-12 text-zinc-400" />
              </div>
              <h3 className="text-lg font-medium text-zinc-600 mb-2">Select a query to view details</h3>
              <p className="text-sm text-zinc-500">Choose from the list on the left</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Query Info Bar */}
            <div className="flex-shrink-0 px-4 py-3 border-b bg-white/70 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-1.5 rounded-lg",
                    selectedQuery.source === 'ai'
                      ? 'bg-gradient-to-br from-blue-100 to-sky-100'
                      : 'bg-gradient-to-br from-zinc-100 to-zinc-200'
                  )}>
                    {selectedQuery.source === 'ai' ? (
                      <Bot className="h-3.5 w-3.5 text-blue-600" />
                    ) : (
                      <User className="h-3.5 w-3.5 text-zinc-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-zinc-900">
                        {selectedQuery.source === 'ai' ? 'AI Generated' : 'Manual Query'}
                      </span>
                      <Badge variant={selectedQuery.success ? 'success' : 'destructive'} className="text-[10px] px-1.5 py-0.5">
                        {selectedQuery.success ? '✓' : '✗'}
                      </Badge>
                      {selectedQuery.execution_time_ms && (
                        <Badge variant="glass" className="text-[10px] px-1.5 py-0.5">
                          {selectedQuery.execution_time_ms}ms
                        </Badge>
                      )}
                      {selectedQuery.rows_affected !== null && selectedQuery.rows_affected !== undefined && (
                        <span className="text-xs text-zinc-600">{selectedQuery.rows_affected} rows</span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      {new Date(selectedQuery.executed_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopySQL}
                    className="h-7 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant={isFormatted ? "secondary" : "brand"}
                    onClick={handleFormatSQL}
                    loading={isFormatting}
                    className="h-7 text-xs"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    {isFormatted ? "Original" : "Format"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Side by Side Content - SQL and Results */}
            <div className="flex-1 grid grid-cols-2 gap-3 p-3 min-h-0">
              {/* SQL Query Panel */}
              <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col min-h-0">
                <div className="flex-shrink-0 px-4 py-3 border-b bg-gradient-to-br from-white to-zinc-50">
                  <div className="text-sm font-semibold flex items-center gap-2 text-zinc-900">
                    <Code2 className="h-3.5 w-3.5 text-blue-600" />
                    SQL Query
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3">
                    <div
                      className="font-mono text-xs text-zinc-800 [&_pre]:bg-transparent [&_pre]:m-0 [&_pre]:p-0 [&_pre]:whitespace-pre [&_pre]:overflow-x-auto"
                      dangerouslySetInnerHTML={{ __html: highlightedSQL || `<pre style="white-space: pre; overflow-x: auto;">${escapeHtml(selectedQuery.query)}</pre>` }}
                    />
                  </div>
                </div>
              </div>

              {/* Results Panel */}
              <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col min-h-0">
                <div className="flex-shrink-0 px-4 py-3 border-b bg-gradient-to-br from-white to-zinc-50">
                  <div className="text-sm font-semibold flex items-center gap-2 text-zinc-900">
                    <FileJson className="h-3.5 w-3.5 text-blue-600" />
                    Results
                    {parsedResultData && Array.isArray(parsedResultData) && (
                      <Badge variant="glass" className="text-[10px] ml-auto px-1.5 py-0">
                        {parsedResultData.length} rows
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {selectedQuery.error_message ? (
                    <div className="p-4">
                      <div className="p-3 rounded-lg border border-red-200 bg-red-50">
                        <div className="flex items-center gap-2 mb-1">
                          <XCircle className="h-3.5 w-3.5 text-red-600" />
                          <span className="font-medium text-xs text-red-700">Error</span>
                        </div>
                        <pre className="text-[11px] text-red-600 whitespace-pre-wrap font-mono">
                          {selectedQuery.error_message}
                        </pre>
                      </div>
                    </div>
                  ) : parsedResultData ? (
                    <div className="p-4">
                      <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3">
                        <JsonView
                          value={parsedResultData}
                          style={{
                            ...githubLightTheme,
                            //@ts-expect-error - Custom properties not in type
                            ['--w-rjv-background-color']: 'transparent',
                            ['--w-rjv-line-color']: '#d0d7de30',
                            fontSize: '12px',
                            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
                          }}
                          collapsed={false}
                          displayDataTypes={false}
                          displayObjectSize={true}
                          enableClipboard={true}
                          shortenTextAfterLength={100}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-zinc-600 p-4">
                      <div className="text-center">
                        <Database className="h-6 w-6 mb-2 mx-auto opacity-50" />
                        <p className="text-xs">No data returned</p>
                        <p className="text-[10px] mt-0.5 text-zinc-500">Query executed successfully</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}