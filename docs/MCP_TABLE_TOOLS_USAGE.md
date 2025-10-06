# MCP Table Tools Usage Guide

## Overview

The `useMCPTableTools` hook provides a powerful, single MCP tool for interacting with table data in your UI. This approach is optimized for AI agents, which work better with fewer, more powerful tools rather than many single-purpose tools.

## Quick Start

```typescript
import { useMCPTableTools } from '@/hooks/useMCPTableTools';

// In your component
useMCPTableTools({
  tableName: 'your_table_name',
  tableDescription: 'Description of what this table contains',
  data: yourDataArray,
  selectedItem: currentlySelectedItem,
  onSelectItem: setSelectedItem,
  searchableFields: ['field1', 'field2'],
  getItemId: (item) => item.id,
  getItemDisplayName: (item) => item.name || item.title,
  customActions: {
    // Add any custom actions specific to your table
  }
});
```

## The Single Powerful Tool

This creates one MCP tool named `table_{your_table_name}` that can perform ALL of these operations:

### Core Operations

1. **list** - Query and paginate data with filters and sorting
2. **get** - Retrieve a specific item by ID or index
3. **search** - Full-text search across specified fields
4. **stats** - Get comprehensive statistics about the data
5. **select** - Select an item in the UI (updates visual selection)
6. **context** - Get current UI state and available operations

### Custom Actions

You can add any domain-specific actions through the `customActions` parameter.

## Example: SQL Execution Log

Here's how it's implemented in the SQL Execution Log screen:

```typescript
useMCPTableTools({
  tableName: 'sql_execution_log',
  tableDescription: 'SQL query execution history with results and errors',
  data: queryHistory,
  selectedItem: selectedQuery,
  onSelectItem: setSelectedQuery,
  searchableFields: ['query', 'error_message'],
  getItemId: (item) => item.id,
  getItemDisplayName: (item) =>
    `${item.source === 'ai' ? 'AI' : 'Manual'} query at ${new Date(item.executed_at).toLocaleTimeString()}`,
  uiContext: {
    totalQueries: queryHistory.length,
    hasSelection: !!selectedQuery,
    selectedId: selectedQuery?.id,
  },
  customActions: {
    format_and_copy: {
      description: 'Format the SQL query and copy to clipboard',
      handler: async (item) => {
        const formatted = await formatSQL(item.query);
        await navigator.clipboard.writeText(formatted);
        toast.success('SQL formatted and copied!');
        return 'Formatted and copied SQL query';
      }
    },
    rerun: {
      description: 'Re-execute the SQL query',
      handler: async (item) => {
        try {
          const result = await pg_lite.query(item.query);
          return {
            success: true,
            rows: result.rows.length,
            message: `Query re-executed, ${result.rows.length} rows returned`
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      }
    },
    delete_entry: {
      description: 'Delete this query from the execution log',
      handler: async (item) => {
        await pg_lite.query('DELETE FROM sql_execution_log WHERE id = $1', [item.id]);
        return 'Query deleted from log';
      }
    }
  }
});
```

## AI Agent Usage Examples

Here's how an AI agent would use the tool:

```javascript
// List recent AI-generated queries
await navigator.mcp.callTool('table_sql_execution_log', {
  operation: 'list',
  filter: { source: 'ai' },
  sortBy: 'executed_at',
  sortOrder: 'desc',
  limit: 10
});

// Search for queries containing "SELECT"
await navigator.mcp.callTool('table_sql_execution_log', {
  operation: 'search',
  query: 'SELECT',
  limit: 5
});

// Get statistics about the queries
await navigator.mcp.callTool('table_sql_execution_log', {
  operation: 'stats'
});

// Select a specific query in the UI
await navigator.mcp.callTool('table_sql_execution_log', {
  operation: 'select',
  id: 'uuid-here'
});

// Format and copy a query
await navigator.mcp.callTool('table_sql_execution_log', {
  operation: 'format_and_copy',
  id: 'uuid-here'
});

// Get current context
await navigator.mcp.callTool('table_sql_execution_log', {
  operation: 'context'
});
```

## Benefits of This Approach

1. **Single Tool**: One powerful tool instead of many small ones
2. **Discoverable**: The `context` operation lists all available operations
3. **Flexible**: Works with any table-like data structure
4. **Extensible**: Easy to add custom actions specific to your data
5. **Type-Safe**: Full TypeScript support with proper typing
6. **AI-Optimized**: Designed for how AI agents work best

## Adding to Other Screens

To add table tools to any other screen with table data:

1. Import the hook:
```typescript
import { useMCPTableTools } from '@/hooks/useMCPTableTools';
```

2. Call it in your component with appropriate configuration
3. The tool will automatically register when the component mounts
4. The tool will automatically unregister when the component unmounts

## Best Practices

1. **Use meaningful table names**: The tool name will be `table_{tableName}`
2. **Provide searchable fields**: This makes the search operation more efficient
3. **Add relevant custom actions**: Think about what operations make sense for your data
4. **Include UI context**: Pass current page, filters, etc. in `uiContext`
5. **Keep handlers async**: Custom action handlers should be async for consistency

## Advanced: Creating Similar Powerful Tools

The pattern used in `useMCPTableTools` can be applied to other UI elements:

- **Forms**: One tool that can get/set all fields, validate, submit, reset
- **Wizards**: One tool that can navigate steps, get/set data, complete
- **Charts**: One tool that can filter, zoom, export, get data points
- **Trees**: One tool that can expand/collapse, select, search, get hierarchy

The key is to think in terms of "operations" rather than individual actions.