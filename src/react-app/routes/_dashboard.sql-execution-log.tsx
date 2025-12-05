import { createFileRoute } from '@tanstack/react-router'
import { pg_lite } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollTextIcon, Bot, User, Trash2, Sparkles, Clock, Copy, Database, CheckCircle2, XCircle, Code2, FileJson } from 'lucide-react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import type { SQLExecutionLog } from '@/lib/db/types'
import { useState, useEffect, useMemo } from 'react'
import { highlightSQL, formatSQL } from '@/lib/syntax-highlight'
import { toast } from 'sonner'
import JsonView from '@uiw/react-json-view'
import { githubLightTheme } from '@uiw/react-json-view/githubLight'
import { githubDarkTheme } from '@uiw/react-json-view/githubDark'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'
import { useMCPSQLTool } from '@/hooks/useMCPSQLTool'
import { useMCPSQLLogPrompts } from '@/hooks/prompts'

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
  const { theme } = useTheme()

  // Determine if dark mode is active
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  // Register MCP tools and prompts for this page
  useMCPSQLTool()
  useMCPSQLLogPrompts()

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
    } catch {
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
    } catch {
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
      highlightSQL(selectedQuery.query, false).then(setHighlightedSQL).catch(() => {
        setHighlightedSQL(`<pre>${escapeHtml(selectedQuery.query)}</pre>`)
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
    <div className="flex flex-col h-full min-w-0 bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border backdrop-blur-xl bg-card/70 z-10">
        <div className="px-4 md:px-6 py-3 md:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-2.5 bg-primary/10 rounded-xl border border-primary/20 flex-shrink-0">
                <ScrollTextIcon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">
                  SQL Execution Log
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground truncate">View AI and manual SQL queries</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="glass" className="font-mono text-xs">
                <Database className="h-3 w-3 mr-1" />
                {queryHistory.length}
              </Badge>
              {queryHistory.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearHistory} className="text-xs">
                  <Trash2 className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Three Column Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 p-3 min-h-0 overflow-hidden">
        {/* Query List Panel */}
        <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col min-h-0 overflow-hidden">
          <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-muted/50">
            <div className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <ScrollTextIcon className="h-3.5 w-3.5 text-primary" />
              Recent Queries
              <Badge variant="glass" className="text-[10px] ml-auto px-1.5 py-0">
                {queryHistory.length}
              </Badge>
            </div>
          </div>

          {queryHistory.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="p-3 bg-muted rounded-xl mb-2">
                <ScrollTextIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-xs font-medium text-muted-foreground">No queries yet</div>
              <div className="text-xs text-muted-foreground/70 mt-0.5">Queries will appear here</div>
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
                        ? 'bg-primary/10 border-primary/30 shadow-sm'
                        : 'bg-card/70 hover:bg-card border-transparent hover:border-border'
                    )}
                  >
                    {/* First Row: Source and Status */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        {item.source === 'ai' ? (
                          <Bot className="h-3 w-3 text-primary" />
                        ) : (
                          <User className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className="text-[11px] font-medium text-foreground">
                          {item.source === 'ai' ? 'AI' : 'Manual'}
                        </span>
                        {item.execution_time_ms && (
                          <span className="text-[10px] text-muted-foreground">
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
                    <div className="text-[11px] font-mono text-muted-foreground line-clamp-2 mb-1">
                      {item.query}
                    </div>

                    {/* Third Row: Time */}
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(item.executed_at).toLocaleTimeString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SQL Query Panel */}
        <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col min-h-0 overflow-hidden">
          <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-muted/50">
            <div className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Code2 className="h-3.5 w-3.5 text-primary" />
              SQL Query
              {selectedQuery && (
                <div className="flex items-center gap-1.5 ml-auto">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopySQL}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleFormatSQL}
                    disabled={isFormatting}
                    className="h-6 w-6 p-0"
                  >
                    <Sparkles className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          {!selectedQuery ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <Code2 className="h-8 w-8 mb-2 mx-auto text-muted-foreground opacity-50" />
                <p className="text-xs text-muted-foreground">Select a query</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Query Info Bar */}
              <div className="flex-shrink-0 px-3 py-2 border-b border-border bg-card/70">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-1 rounded flex-shrink-0",
                    selectedQuery.source === 'ai' ? 'bg-primary/10' : 'bg-muted'
                  )}>
                    {selectedQuery.source === 'ai' ? (
                      <Bot className="h-3 w-3 text-primary" />
                    ) : (
                      <User className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <Badge variant={selectedQuery.success ? 'success' : 'destructive'} className="text-[10px] px-1.5 py-0">
                    {selectedQuery.success ? '✓' : '✗'}
                  </Badge>
                  {selectedQuery.execution_time_ms && (
                    <Badge variant="glass" className="text-[10px] px-1.5 py-0">
                      {selectedQuery.execution_time_ms}ms
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {new Date(selectedQuery.executed_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <div className="rounded-lg bg-muted border border-border p-3">
                  <div
                    className="font-mono text-xs text-foreground [&_pre]:bg-transparent [&_pre]:m-0 [&_pre]:p-0 [&_pre]:whitespace-pre [&_pre]:overflow-x-auto"
                    dangerouslySetInnerHTML={{ __html: highlightedSQL || `<pre style="white-space: pre; overflow-x: auto;">${escapeHtml(selectedQuery.query)}</pre>` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col min-h-0 overflow-hidden">
          <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-muted/50">
            <div className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <FileJson className="h-3.5 w-3.5 text-primary" />
              Results
              {selectedQuery && parsedResultData && Array.isArray(parsedResultData) && (
                <Badge variant="glass" className="text-[10px] ml-auto px-1.5 py-0">
                  {parsedResultData.length} rows
                </Badge>
              )}
            </div>
          </div>
          {!selectedQuery ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <FileJson className="h-8 w-8 mb-2 mx-auto text-muted-foreground opacity-50" />
                <p className="text-xs text-muted-foreground">Results will appear here</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {selectedQuery.error_message ? (
                <div className="p-3">
                  <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="h-3.5 w-3.5 text-destructive" />
                      <span className="font-medium text-xs text-destructive">Error</span>
                    </div>
                    <pre className="text-[11px] text-destructive whitespace-pre-wrap font-mono">
                      {selectedQuery.error_message}
                    </pre>
                  </div>
                </div>
              ) : parsedResultData ? (
                <div className="p-3">
                  <div className="rounded-lg bg-muted border border-border p-3">
                    <JsonView
                      value={parsedResultData}
                      style={{
                        ...(isDarkMode ? githubDarkTheme : githubLightTheme),
                        //@ts-expect-error - Custom properties not in type
                        ['--w-rjv-background-color']: 'transparent',
                        ['--w-rjv-line-color']: isDarkMode ? '#3d444d50' : '#d0d7de30',
                        fontSize: '11px',
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
                      }}
                      collapsed={false}
                      displayDataTypes={false}
                      displayObjectSize={true}
                      enableClipboard={true}
                      shortenTextAfterLength={80}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground p-4">
                  <div className="text-center">
                    <Database className="h-6 w-6 mb-2 mx-auto opacity-50" />
                    <p className="text-xs">No data returned</p>
                    <p className="text-[10px] mt-0.5 text-muted-foreground/70">Query executed successfully</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}