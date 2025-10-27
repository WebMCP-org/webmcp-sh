// Type declarations for global Prettier
declare global {
  interface Window {
    prettier: {
      format: (source: string, options: any) => string
    }
    prettierPlugins: any
  }
}

/**
 * Format JavaScript/TypeScript code using Prettier
 * @param code - The code to format
 * @param parser - The parser to use (babel, typescript, etc.)
 * @returns Formatted code or original if formatting fails
 */
export function formatJavaScript(code: string, parser: 'babel' | 'typescript' = 'babel'): string {
  if (typeof window === 'undefined' || !window.prettier || !window.prettierPlugins) {
    console.warn('Prettier not loaded')
    return code
  }

  try {
    return window.prettier.format(code, {
      parser,
      plugins: window.prettierPlugins,
      semi: false,
      singleQuote: true,
      tabWidth: 2,
      printWidth: 80,
      trailingComma: 'es5',
    })
  } catch (error) {
    console.error('Failed to format JavaScript/TypeScript:', error)
    return code
  }
}

/**
 * Format SQL code using Prettier's SQL plugin (if available)
 * Falls back to sql-formatter if Prettier SQL plugin is not loaded
 * @param code - The SQL code to format
 * @returns Formatted SQL code
 */
export async function formatSQLWithPrettier(code: string): Promise<string> {
  // First try Prettier's SQL plugin if available
  if (typeof window !== 'undefined' && window.prettier && window.prettierPlugins?.sql) {
    try {
      return window.prettier.format(code, {
        parser: 'sql',
        plugins: window.prettierPlugins,
        printWidth: 80,
        tabWidth: 2,
      })
    } catch (error) {
      console.warn('Prettier SQL formatting failed, falling back to sql-formatter:', error)
    }
  }

  // Fall back to sql-formatter (already imported in syntax-highlight.ts)
  const { format } = await import('sql-formatter')
  try {
    return format(code, {
      language: 'postgresql',
      tabWidth: 2,
      keywordCase: 'upper',
      dataTypeCase: 'upper',
      functionCase: 'upper',
    })
  } catch (error) {
    console.error('SQL formatting failed:', error)
    return code
  }
}

/**
 * Detect language and format code accordingly
 * @param code - The code to format
 * @param language - The language hint (optional)
 * @returns Formatted code
 */
export async function formatCode(code: string, language?: string): Promise<string> {
  if (!language) {
    // Try to auto-detect based on content
    if (code.match(/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i)) {
      language = 'sql'
    } else if (code.includes('function') || code.includes('const') || code.includes('=>')) {
      language = 'javascript'
    } else {
      return code // Can't determine language
    }
  }

  switch (language.toLowerCase()) {
    case 'sql':
    case 'postgresql':
    case 'mysql':
      return formatSQLWithPrettier(code)

    case 'javascript':
    case 'js':
    case 'jsx':
      return formatJavaScript(code, 'babel')

    case 'typescript':
    case 'ts':
    case 'tsx':
      return formatJavaScript(code, 'typescript')

    default:
      return code // No formatter for this language
  }
}

/**
 * Check if Prettier is loaded and ready
 */
export function isPrettierReady(): boolean {
  return typeof window !== 'undefined' &&
         window.prettier !== undefined &&
         window.prettierPlugins !== undefined
}

/**
 * Wait for Prettier to be loaded (with timeout)
 */
export async function waitForPrettier(timeout = 5000): Promise<boolean> {
  const start = Date.now()

  while (Date.now() - start < timeout) {
    if (isPrettierReady()) {
      return true
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return false
}
