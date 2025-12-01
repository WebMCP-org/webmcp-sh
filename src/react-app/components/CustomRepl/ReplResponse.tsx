import type { Results, Response } from './types'
import { ReplTable } from './ReplTable'
import { useEffect, useState } from 'react'
import { highlightSQL } from '@/lib/syntax-highlight'

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
        setHighlightedSQL(`<pre>${response.query}</pre>`)
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
    <div className={`PGliteRepl-response ${collapsed ? 'collapsed' : ''}`}>
      {/* Left side: Query */}
      <div className="PGliteRepl-query-panel">
        <div className="PGliteRepl-panel-header" onClick={toggleCollapse}>
          <span className="PGliteRepl-collapse-icon">▼</span>
          <span className="PGliteRepl-panel-icon">❯</span>
          <span className="PGliteRepl-panel-label">
            Query
            <span className={`PGliteRepl-status-icon ${isSuccess ? 'PGliteRepl-status-success' : 'PGliteRepl-status-error'}`}>
              {isSuccess ? '✓' : '✗'}
            </span>
          </span>
          {showTime && (
            <span className="PGliteRepl-panel-time">{response.time.toFixed(1)}ms</span>
          )}
        </div>
        <div
          className="PGliteRepl-query-content"
          dangerouslySetInnerHTML={{ __html: highlightedSQL || `<pre>${response.query}</pre>` }}
        />
      </div>

      {/* Right side: Results */}
      <div className={`PGliteRepl-results-panel ${isError ? 'PGliteRepl-results-error' : ''}`}>
        <div className="PGliteRepl-panel-header">
          <span className="PGliteRepl-panel-icon">{isError ? '!' : '❮'}</span>
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
