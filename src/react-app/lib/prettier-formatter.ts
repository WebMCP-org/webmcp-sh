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
