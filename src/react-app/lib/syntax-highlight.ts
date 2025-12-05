import { common, createStarryNight } from '@wooorm/starry-night'
import { toHtml } from 'hast-util-to-html'
import { format } from 'sql-formatter'
import { formatSQLWithPrettier } from './prettier-formatter'

let starryNightInstance: Awaited<ReturnType<typeof createStarryNight>> | null = null

/**
 * Initialize the syntax highlighter (lazy loading)
 */
async function getStarryNight() {
  if (!starryNightInstance) {
    starryNightInstance = await createStarryNight(common)
  }
  return starryNightInstance
}

/**
 * Format SQL code for better readability
 * Uses Prettier if available, falls back to sql-formatter
 */
export async function formatSQL(code: string): Promise<string> {
  try {
    // Try Prettier first, which will fall back to sql-formatter if needed
    return await formatSQLWithPrettier(code)
  } catch (error) {
    console.error('Error formatting SQL:', error)
    // Final fallback: try sql-formatter directly
    try {
      return format(code, {
        language: 'postgresql',
        tabWidth: 2,
        keywordCase: 'upper',
        dataTypeCase: 'upper',
        functionCase: 'upper',
      })
    } catch (fallbackError) {
      console.error('Fallback SQL formatting failed:', fallbackError)
      return code
    }
  }
}

/**
 * Highlight SQL code with syntax highlighting (with optional formatting)
 */
export async function highlightSQL(code: string, shouldFormat: boolean = true): Promise<string> {
  try {
    const formattedCode = shouldFormat ? await formatSQL(code) : code
    const starryNight = await getStarryNight()
    const scope = 'source.sql'
    const tree = starryNight.highlight(formattedCode, scope)
    // Wrap in pre tag to preserve formatting
    const html = toHtml(tree)
    // Make sure we preserve whitespace and formatting
    return `<pre style="white-space: pre; overflow-x: auto;">${html}</pre>`
  } catch (error) {
    console.error('Error highlighting SQL:', error)
    // Fallback to plain text
    const fallbackCode = shouldFormat ? await formatSQL(code) : code
    return `<pre style="white-space: pre; overflow-x: auto;"><code>${escapeHtml(fallbackCode)}</code></pre>`
  }
}

/**
 * Highlight code with auto-detected language
 */
export async function highlightCode(code: string, language?: string): Promise<string> {
  try {
    const starryNight = await getStarryNight()

    // Try to get scope from language flag
    const scope = language
      ? starryNight.flagToScope(language)
      : starryNight.flagToScope('txt')

    if (!scope) {
      // Fallback to plain text
      return `<pre><code>${escapeHtml(code)}</code></pre>`
    }

    const tree = starryNight.highlight(code, scope)
    return toHtml(tree)
  } catch (error) {
    console.error('Error highlighting code:', error)
    return `<pre><code>${escapeHtml(code)}</code></pre>`
  }
}

/**
 * Escape HTML special characters
 */
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
