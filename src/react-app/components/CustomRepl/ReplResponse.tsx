import type { Results, Response } from './types'
import { ReplTable } from './ReplTable'
import { useEffect, useState } from 'react'
import { highlightSQL } from '@/lib/syntax-highlight'

// Escape HTML to prevent XSS
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Truncate query for preview in collapsed state
function truncateQuery(query: string, maxLength = 60): string {
  const singleLine = query.replace(/\s+/g, ' ').trim()
  if (singleLine.length <= maxLength) return singleLine
  return singleLine.slice(0, maxLength) + '…'
}

function OutLine({ result }: { result: Results }) {
  return (
    <div className="PGliteRepl-result-line">
      {result.fields.length > 0 ? (
        <ReplTable result={result} />
      ) : (
        <div className="PGliteRepl-null">null</div>
      )}
    </div>
  )
}

export function ReplResponse({
  response,
  showTime,
}: {
  response: Response
  showTime: boolean
}) {
  const [highlightedSQL, setHighlightedSQL] = useState<string>('')
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (response.query) {
      highlightSQL(response.query).then(setHighlightedSQL).catch(() => {
        // Escape HTML to prevent XSS when syntax highlighting fails
        setHighlightedSQL(`<pre>${escapeHtml(response.query)}</pre>`)
      })
    }
  }, [response.query])

  const rowCount = response.results?.reduce((acc, r) => acc + (r.rows?.length ?? 0), 0) ?? 0
  const isError = !!response.error
  const isSuccess = !isError

  let resultContent
  if (response.error) {
    resultContent = (
      <div className="PGliteRepl-error-content">{response.error}</div>
    )
  } else if (response.text) {
    resultContent = (
      <div className="PGliteRepl-text-content">{response.text}</div>
    )
  } else {
    resultContent = (
      <div className="PGliteRepl-results-list">
        {response.results?.map((result, i) => (
          <OutLine key={i} result={result} />
        ))}
      </div>
    )
  }

  const toggleCollapse = () => setCollapsed(!collapsed)

  return (
    <div
      className={`PGliteRepl-response ${collapsed ? 'collapsed' : ''}`}
      role="region"
      aria-label={`Query: ${truncateQuery(response.query, 40)}`}
    >
      {/* Left side: Query */}
      <div className="PGliteRepl-query-panel">
        <button
          type="button"
          className="PGliteRepl-panel-header"
          onClick={toggleCollapse}
          aria-expanded={!collapsed}
          aria-controls={`query-content-${response.time}`}
          title={collapsed ? 'Expand to see full query and results' : 'Collapse query details'}
        >
          <span className="PGliteRepl-collapse-icon" aria-hidden="true">▼</span>
          <span className="PGliteRepl-panel-icon" aria-hidden="true">❯</span>
          <span className="PGliteRepl-panel-label">
            Query
            <span
              className={`PGliteRepl-status-icon ${isSuccess ? 'PGliteRepl-status-success' : 'PGliteRepl-status-error'}`}
              role="img"
              aria-label={isSuccess ? 'Success' : 'Error'}
            >
              {isSuccess ? '✓' : '✗'}
            </span>
          </span>
          {collapsed && (
            <span className="PGliteRepl-query-preview">{truncateQuery(response.query)}</span>
          )}
          {showTime && (
            <span className="PGliteRepl-panel-time">{response.time.toFixed(1)}ms</span>
          )}
        </button>
        <div
          id={`query-content-${response.time}`}
          className="PGliteRepl-query-content"
          dangerouslySetInnerHTML={{ __html: highlightedSQL || `<pre>${escapeHtml(response.query)}</pre>` }}
        />
      </div>

      {/* Right side: Results */}
      <div className={`PGliteRepl-results-panel ${isError ? 'PGliteRepl-results-error' : ''}`}>
        <div className="PGliteRepl-results-header">
          <span className="PGliteRepl-panel-icon" aria-hidden="true">{isError ? '!' : '❮'}</span>
          <span className="PGliteRepl-panel-label">
            {isError ? 'Error' : response.text ? 'Output' : `Results (${rowCount} row${rowCount !== 1 ? 's' : ''})`}
          </span>
        </div>
        <div className="PGliteRepl-results-content">
          {resultContent}
        </div>
      </div>
    </div>
  )
}
