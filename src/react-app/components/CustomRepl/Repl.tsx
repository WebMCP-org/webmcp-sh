import { useState, useCallback, useMemo, useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import CodeMirror, {
  type ReactCodeMirrorRef,
  type Extension,
} from '@uiw/react-codemirror'
import type { CreateThemeOptions } from '@uiw/codemirror-themes'
import { defaultKeymap } from '@codemirror/commands'
import { keymap } from '@codemirror/view'
import { PostgreSQL } from '@codemirror/lang-sql'
import type { PGliteInterface } from '@electric-sql/pglite'
import type { PGliteWithLive } from '@electric-sql/pglite/live'
import { usePGlite } from '@electric-sql/pglite-react'
import { makeSqlExt } from './sqlSupport'
import type { Response } from './types'
import { runQuery, getSchema } from './utils'
import { ReplResponse } from './ReplResponse'
import {
  githubDark,
  githubDarkInit,
  githubLight,
  githubLightInit,
} from '@uiw/codemirror-theme-github'

import './Repl.css'
import { formatSQL } from '@/lib/syntax-highlight'
import { toast } from 'sonner'

// Filter out the Enter key from the default keymap, we entirely override its behavior
// to run the query when the user presses Enter.
// We keep the up and down arrow keys as we only override their behavior
// when the cursor is on the first or last line.
const baseKeymap = defaultKeymap.filter((key) => key.key !== 'Enter')

export type ReplTheme = 'light' | 'dark' | 'auto'

type ThemeInit = (options?: Partial<CreateThemeOptions>) => Extension

export const defaultLightThemeInit: ThemeInit = githubLightInit
export const defaultLightTheme = githubLight
export const defaultDarkThemeInit: ThemeInit = githubDarkInit
export const defaultDarkTheme = githubDark

export interface ReplProps {
  pg?: PGliteInterface
  border?: boolean
  lightTheme?: Extension
  darkTheme?: Extension
  theme?: ReplTheme
  showTime?: boolean
  disableUpdateSchema?: boolean
  showToolbar?: boolean
}

export interface ReplRef {
  executeQuery: (query: string) => Promise<Response>
}

export const Repl = forwardRef<ReplRef, ReplProps>(function Repl({
  pg: pgProp,
  border = false,
  lightTheme = defaultLightTheme,
  darkTheme = defaultDarkTheme,
  theme = 'auto',
  showTime = false,
  disableUpdateSchema = false,
  showToolbar = true,
}, ref) {
  const [value, setValue] = useState('')
  const valueNoHistory = useRef('')
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const executingRef = useRef(false) // Ref to avoid useMemo recreation
  const [output, setOutput] = useState<Response[]>([])
  const outputRef = useRef<HTMLDivElement | null>(null)
  const [schema, setSchema] = useState<Record<string, string[]>>({})
  const historyPos = useRef(-1)
  const rcm = useRef<ReactCodeMirrorRef | null>(null)
  const [themeToUse, setThemeToUse] = useState<Extension>(
    theme === 'dark' ? darkTheme : lightTheme,
  )
  const [styles, setStyles] = useState<{ [key: string]: string | number }>({})

  const pg: PGliteInterface = usePGlite(pgProp as PGliteWithLive)

  useEffect(() => {
    let ignore = false
    const init = async () => {
      await pg.waitReady
      if (ignore) return
      setLoading(false)
    }
    setLoading(true)
    init()
    return () => {
      ignore = true
    }
  }, [pg])

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (outputRef.current && output.length > 0) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (outputRef.current) {
          outputRef.current.scrollTo({
            top: outputRef.current.scrollHeight,
            behavior: 'smooth'
          })
        }
      })
    }
  }, [output])

  useEffect(() => {
    if (theme === 'auto') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'
      setThemeToUse(systemTheme === 'dark' ? darkTheme : lightTheme)
      const listener = (e: MediaQueryListEvent) => {
        setThemeToUse(e.matches ? darkTheme : lightTheme)
        setTimeout(() => {
          extractStyles()
        }, 0)
      }
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', listener)
      return () => {
        window
          .matchMedia('(prefers-color-scheme: dark)')
          .removeEventListener('change', listener)
      }
    } else {
      setThemeToUse(theme === 'dark' ? darkTheme : lightTheme)
      setTimeout(() => {
        extractStyles()
      }, 0)
      return
    }
  }, [theme, lightTheme, darkTheme])

  const onChange = useCallback((val: string) => {
    extractStyles()
    setValue(val)
    if (historyPos.current === -1) {
      valueNoHistory.current = val
    }
  }, [])

  // Format SQL in editor
  const handleFormat = async () => {
    if (!value.trim()) return

    try {
      const formatted = await formatSQL(value)
      setValue(formatted)
      toast.success('SQL formatted!')
    } catch {
      toast.error('Failed to format SQL')
    }
  }

  // Helper to update both state and ref for executing
  const setExecutingState = (value: boolean) => {
    executingRef.current = value
    setExecuting(value)
  }

  // Expose executeQuery method to parent components
  useImperativeHandle(ref, () => ({
    executeQuery: async (query: string): Promise<Response> => {
      setExecutingState(true)
      try {
        const response = await runQuery(query, pg)
        setOutput((prev) => [...prev, response])
        // Show toast notification for query result
        if (response.error) {
          toast.error(response.error)
        } else {
          const rowCount = response.results?.reduce((acc, r) => acc + (r.rows?.length ?? 0), 0) ?? 0
          toast.success(`Query executed successfully (${rowCount} row${rowCount !== 1 ? 's' : ''})`)
        }
        // Update the schema for any new tables to be used in autocompletion
        if (!disableUpdateSchema) {
          getSchema(pg).then(setSchema)
        }
        return response
      } finally {
        setExecutingState(false)
      }
    },
  }), [pg, disableUpdateSchema])

  const extensions = useMemo(
    () => [
      keymap.of([
        {
          key: 'Enter',
          preventDefault: true,
          run: () => {
            // Use ref to check executing state to avoid useMemo recreation
            if (value.trim() === '' || executingRef.current) return false
            setExecutingState(true)
            runQuery(value, pg).then((response) => {
              setOutput((prev) => [...prev, response])
              // Show toast notification for query result
              if (response.error) {
                toast.error(response.error)
              } else {
                const rowCount = response.results?.reduce((acc, r) => acc + (r.rows?.length ?? 0), 0) ?? 0
                toast.success(`Query executed successfully (${rowCount} row${rowCount !== 1 ? 's' : ''})`)
              }
              // Update the schema for any new tables to be used in autocompletion
              if (!disableUpdateSchema) {
                getSchema(pg).then(setSchema)
              }
            }).finally(() => {
              setExecutingState(false)
            })
            historyPos.current = -1
            valueNoHistory.current = ''
            setValue('')
            return true
          },
        },
        {
          key: 'ArrowUp',
          run: (view) => {
            const state = view.state
            const cursorLine = state.doc.lineAt(
              state.selection.main.head,
            ).number
            if (cursorLine === 1) {
              // If the cursor is on the first line, go back in history
              const currentPos = historyPos.current
              historyPos.current++
              if (historyPos.current >= output.length) {
                historyPos.current = output.length - 1
              }
              if (historyPos.current < -1) {
                historyPos.current = -1
              }
              if (historyPos.current === currentPos) return true
              if (historyPos.current === -1) {
                setValue(valueNoHistory.current)
              } else {
                setValue(output[output.length - historyPos.current - 1].query)
              }
              return true // Prevent the default behavior
            }
            return false // Allow the default behavior
          },
        },
        {
          key: 'ArrowDown',
          run: (view) => {
            const state = view.state
            const cursorLine = state.doc.lineAt(
              state.selection.main.head,
            ).number
            const lastLine = state.doc.lines
            if (cursorLine === lastLine) {
              // If the cursor is on the last line, go forward in history
              const currentPos = historyPos.current
              historyPos.current--
              if (historyPos.current >= output.length) {
                historyPos.current = output.length - 1
              }
              if (historyPos.current < -1) {
                historyPos.current = -1
              }
              if (historyPos.current === currentPos) return true
              if (historyPos.current === -1) {
                setValue(valueNoHistory.current)
              } else {
                setValue(output[output.length - historyPos.current - 1].query)
              }
              return true // Prevent the default behavior
            }
            return false // Allow the default behavior
          },
        },
        ...baseKeymap,
      ]),
      makeSqlExt({
        dialect: PostgreSQL,
        schema: schema,
        tables: [
          {
            label: 'd',
            displayLabel: '\\d',
          },
        ],
        defaultSchema: 'public',
      }),
    ],
    [pg, schema, value, output, disableUpdateSchema],
  )

  const extractStyles = () => {
    // Get the styles from the CodeMirror editor to use in the REPL
    const cmEditorEl = rcm.current?.editor?.querySelector('.cm-editor')
    if (!cmEditorEl) {
      return // Editor not ready yet, will retry later
    }
    const gutterEl = cmEditorEl.querySelector('.cm-gutters')
    const cmEditorElComputedStyles = window.getComputedStyle(cmEditorEl)
    const foregroundColor = cmEditorElComputedStyles.color
    const backgroundColor = cmEditorElComputedStyles.backgroundColor

    // Safely get gutter styles, with fallback if gutters aren't rendered
    let gutterBorder = ''
    let borderColor = foregroundColor.replace('rgb', 'rgba').replace(')', ', 0.15)')
    let border = `1px solid ${borderColor}`

    if (gutterEl) {
      const gutterElComputedStyles = window.getComputedStyle(gutterEl)
      gutterBorder = gutterElComputedStyles.borderRight
      const borderWidth = parseInt(gutterElComputedStyles.borderRightWidth) || 0
      if (borderWidth) {
        borderColor = gutterElComputedStyles.borderRightColor
        border = gutterElComputedStyles.borderRight
      }
    }

    setStyles({
      '--PGliteRepl-foreground-color': foregroundColor,
      '--PGliteRepl-background-color': backgroundColor,
      '--PGliteRepl-border': border,
      '--PGliteRepl-gutter-border': gutterBorder,
      '--PGliteRepl-border-color': borderColor,
    })
  }

  return (
    <div
      className={`
      PGliteRepl-root
      ${border ? 'PGliteRepl-root-border' : ''}
    `}
      style={styles}
    >
      <div className="PGliteRepl-output" ref={outputRef}>
        {loading && <div className="PGliteRepl-loading-msg">Loading...</div>}
        {output.map((response, index) => (
          <ReplResponse key={`${index}-${response.time}`} response={response} showTime={showTime} />
        ))}
      </div>
      {showToolbar && value.trim() && (
        <div className="PGliteRepl-toolbar" style={{
          borderTop: `1px solid ${styles['--PGliteRepl-border-color']}`,
          padding: '4px 8px',
          background: styles['--PGliteRepl-background-color'],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={handleFormat}
            disabled={loading || executing}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              borderRadius: '4px',
              border: `1px solid ${styles['--PGliteRepl-border-color']}`,
              background: 'transparent',
              color: String(styles['--PGliteRepl-foreground-color']),
              cursor: (loading || executing) ? 'not-allowed' : 'pointer',
              opacity: (loading || executing) ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ✨ Format SQL
          </button>
        </div>
      )}
      <div className="PGliteRepl-input-wrapper">
        <div className={`PGliteRepl-input ${loading || executing ? 'PGliteRepl-input-loading' : ''}`}>
          <CodeMirror
            ref={rcm}
            width="100%"
            value={value}
            basicSetup={{
              defaultKeymap: false,
            }}
            extensions={extensions}
            theme={themeToUse}
            onChange={onChange}
            editable={!loading && !executing}
            onCreateEditor={() => {
              extractStyles()
              setTimeout(extractStyles, 0)
              getSchema(pg).then(setSchema)
            }}
          />
          {executing && <div className="PGliteRepl-spinner" />}
        </div>
        <div className="PGliteRepl-hints">
          <span className="PGliteRepl-hint">
            <kbd>Enter</kbd> Run query
          </span>
          <span className="PGliteRepl-hint">
            <kbd>↑</kbd><kbd>↓</kbd> History
          </span>
        </div>
      </div>
    </div>
  )
})
