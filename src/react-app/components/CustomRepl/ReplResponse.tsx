import type { Results, Response } from './types'
import { ReplTable } from './ReplTable'
import { useEffect, useState } from 'react'
import { highlightSQL } from '@/lib/syntax-highlight'

function OutLine({ result }: { result: Results }) {
  return (
    <div className="PGliteRepl-line">
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

  useEffect(() => {
    if (response.query) {
      highlightSQL(response.query).then(setHighlightedSQL).catch((error) => {
        console.error('Failed to highlight SQL:', error)
        setHighlightedSQL(`<pre>${response.query}</pre>`)
      })
    }
  }, [response.query])

  let out
  if (response.error) {
    out = (
      <div className="PGliteRepl-line PGliteRepl-error">{response.error}</div>
    )
  } else {
    out = (
      <>
        {response.results?.map((result, i) => (
          // eslint-disable-next-line @eslint-react/no-array-index-key
          <OutLine key={i} result={result} />
        ))}
      </>
    )
  }
  return (
    <>
      <div
        className="PGliteRepl-line PGliteRepl-query"
        dangerouslySetInnerHTML={{ __html: highlightedSQL || `<pre>${response.query}</pre>` }}
      />
      {response.text && (
        <div className="PGliteRepl-line PGliteRepl-text">{response.text}</div>
      )}
      {out}
      <div className="PGliteRepl-divider">
        <hr />
        {showTime && (
          <div className="PGliteRepl-time">{response.time.toFixed(1)}ms</div>
        )}
      </div>
    </>
  )
}
