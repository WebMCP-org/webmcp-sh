import { z } from 'zod';
import { useMCPTool } from './useMCPTool';
import { useCallback, useMemo } from 'react';
import type {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  PaginationState,
  Table,
  GroupingState,
  ExpandedState
} from '@tanstack/react-table';

/**
 * Base constraint for table data items
 */
type TableItem = Record<string, unknown>;

/**
 * Operation input type
 */
interface OperationInput {
  operation: string;
  // Filter operations
  column?: string;
  value?: unknown;
  filterType?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'notEquals' | 'notContains';
  secondValue?: unknown; // For 'between' filter type
  filters?: Array<{ column: string; value?: unknown; filterType?: string; secondValue?: unknown }>; // For batch filtering

  // Grouping operations
  groupBy?: string | string[];
  expanded?: boolean;
  rowId?: string;

  // Sort operations
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';

  // Pagination
  page?: number;
  pageSize?: number;

  // Search
  query?: string;

  // Selection
  id?: string | number;
  index?: number;

  // Column visibility
  columns?: string[];
  visible?: boolean;
}

/**
 * Configuration for table tools with state management
 */
export interface TableToolsConfig<T extends TableItem = TableItem> {
  /** Unique name for this table (e.g., 'memory_blocks') */
  tableName: string;
  /** Human-readable description of what this table contains */
  tableDescription: string;
  /** The current data being displayed */
  data: T[];
  /** Currently selected item(s) */
  selectedItem?: T | null;
  /** Callback to select an item */
  onSelectItem?: (item: T | null) => void;

  /** TanStack React Table instance (if available) */
  table?: Table<T>;

  /** State management for filtering */
  columnFilters?: ColumnFiltersState;
  setColumnFilters?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;

  /** State management for sorting */
  sorting?: SortingState;
  setSorting?: React.Dispatch<React.SetStateAction<SortingState>>;

  /** State management for global search */
  globalFilter?: string;
  setGlobalFilter?: React.Dispatch<React.SetStateAction<string>>;

  /** State management for column visibility */
  columnVisibility?: VisibilityState;
  setColumnVisibility?: React.Dispatch<React.SetStateAction<VisibilityState>>;

  /** State management for pagination */
  pagination?: PaginationState;
  setPagination?: React.Dispatch<React.SetStateAction<PaginationState>>;

  /** State management for grouping */
  grouping?: GroupingState;
  setGrouping?: React.Dispatch<React.SetStateAction<GroupingState>>;

  /** State management for expanded rows */
  expanded?: ExpandedState;
  setExpanded?: React.Dispatch<React.SetStateAction<ExpandedState>>;

  /** Custom actions that can be performed on items */
  customActions?: {
    [key: string]: {
      description: string;
      handler: (item: T) => Promise<unknown> | unknown;
    };
  };

  /** Fields that should be searchable/filterable */
  searchableFields?: string[];
  /** Function to get a unique ID for an item */
  getItemId?: (item: T) => string | number;
  /** Function to get a display name for an item */
  getItemDisplayName?: (item: T) => string;
}

/**
 * Powerful hook for exposing table data and interactions as MCP tools
 * This version manipulates React state to update the UI in real-time
 */
export function useMCPTableTools<T extends TableItem = TableItem>(config?: TableToolsConfig<T>) {
  const {
    tableName = 'table',
    tableDescription = 'table',
    data = [],
    selectedItem,
    onSelectItem,
    table,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
    globalFilter,
    setGlobalFilter,
    columnVisibility,
    setColumnVisibility,
    pagination,
    setPagination,
    grouping,
    setGrouping,
    expanded,
    setExpanded,
    customActions,
    searchableFields = [],
    getItemId = (item: T) => {
      const id = item['id'];
      if (id !== undefined && (typeof id === 'string' || typeof id === 'number')) {
        return id;
      }
      return JSON.stringify(item);
    },
    getItemDisplayName = (item: T) => {
      const name = item['name'];
      const title = item['title'];
      if (typeof name === 'string') return name;
      if (typeof title === 'string') return title;
      return JSON.stringify(item).substring(0, 50);
    },
  } = config || {};

  // Memoize available operations
  const availableOperations = useMemo(() => {
    const ops = [
      'filter_column - Add or update a column filter with advanced filter types',
      'batch_filter - Apply multiple filters at once',
      'clear_filter - Clear a specific column filter or all filters',
      'group_by - Group rows by one or more columns',
      'clear_grouping - Clear all grouping',
      'expand_row - Expand/collapse grouped rows',
      'expand_all - Expand or collapse all grouped rows',
      'sort - Sort by a column',
      'search - Global search across all searchable fields',
      'clear_search - Clear the global search',
      'paginate - Go to a specific page',
      'set_page_size - Change the number of items per page',
      'toggle_column - Show or hide columns',
      'select - Select an item in the UI',
      'clear_selection - Clear the current selection',
      'get_state - Get current table state (filters, sorting, grouping, etc.)',
      'reset - Reset all filters, sorting, grouping, and search',
    ];

    if (customActions) {
      Object.keys(customActions).forEach(action => {
        ops.push(`${action} - ${customActions[action].description}`);
      });
    }

    return ops;
  }, [customActions]);

  // Build comprehensive operation handler
  const handleOperation = useCallback(async (input: OperationInput) => {
    const { operation, ...params } = input;

    switch (operation) {
      case 'filter_column': {
        const { column, value, filterType = 'contains', secondValue } = params;

        if (!column) {
          throw new Error('Column name is required for filtering');
        }

        // Prepare filter value based on filter type
        let filterValue: unknown = value;
        let message = `Added filter: ${column} ${filterType} "${value}"`;

        if (filterType === 'between' && secondValue !== undefined) {
          // For 'between' filter, TanStack Table expects an array [min, max]
          filterValue = [value, secondValue];
          message = `Added filter: ${column} between ${value} and ${secondValue}`;
        }

        if (setColumnFilters) {
          const newFilter = { id: column, value: filterValue };
          setColumnFilters((prev: ColumnFiltersState) => {
            const existing = prev.filter(f => f.id !== column);
            if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
              return [...existing, newFilter];
            }
            return existing;
          });
          return {
            success: true,
            message,
            current_filters: columnFilters
          };
        } else if (table) {
          table.getColumn(column)?.setFilterValue(filterValue);
          return {
            success: true,
            message
          };
        }

        return { error: 'Filtering not supported - no state setters provided' };
      }

      case 'clear_filter': {
        const { column } = params;

        if (column) {
          if (setColumnFilters) {
            setColumnFilters((prev: ColumnFiltersState) => prev.filter(f => f.id !== column));
            return { success: true, message: `Cleared filter for column: ${column}` };
          } else if (table) {
            table.getColumn(column)?.setFilterValue(undefined);
            return { success: true, message: `Cleared filter for column: ${column}` };
          }
        } else {
          if (setColumnFilters) {
            setColumnFilters([]);
            return { success: true, message: 'Cleared all filters' };
          } else if (table) {
            table.resetColumnFilters();
            return { success: true, message: 'Cleared all filters' };
          }
        }

        return { error: 'Filtering not supported - no state setters provided' };
      }

      case 'batch_filter': {
        const { filters } = params;

        if (!filters || !Array.isArray(filters)) {
          throw new Error('Filters array is required for batch filtering');
        }

        if (setColumnFilters) {
          const newFilters = filters
            .filter(f => f.value !== undefined && f.value !== null && f.value !== '')
            .map(f => {
              // Handle 'between' filter type
              let filterValue: unknown = f.value;
              if (f.filterType === 'between' && f.secondValue !== undefined) {
                filterValue = [f.value, f.secondValue];
              }
              return { id: f.column, value: filterValue };
            });
          setColumnFilters(newFilters);
          return {
            success: true,
            message: `Applied ${newFilters.length} filters`,
            filters_applied: filters
          };
        } else if (table) {
          filters.forEach(f => {
            if (f.value !== undefined && f.value !== null && f.value !== '') {
              // Handle 'between' filter type
              let filterValue: unknown = f.value;
              if (f.filterType === 'between' && f.secondValue !== undefined) {
                filterValue = [f.value, f.secondValue];
              }
              table.getColumn(f.column)?.setFilterValue(filterValue);
            }
          });
          return {
            success: true,
            message: `Applied ${filters.length} filters`,
            filters_applied: filters
          };
        }

        return { error: 'Batch filtering not supported - no state setters provided' };
      }

      case 'group_by': {
        const { groupBy } = params;

        if (!groupBy) {
          throw new Error('Column(s) required for grouping');
        }

        const groupingColumns = Array.isArray(groupBy) ? groupBy : [groupBy];

        if (setGrouping) {
          setGrouping(groupingColumns);
          return {
            success: true,
            message: `Grouped by: ${groupingColumns.join(', ')}`,
            current_grouping: groupingColumns
          };
        } else if (table) {
          table.setGrouping(groupingColumns);
          return {
            success: true,
            message: `Grouped by: ${groupingColumns.join(', ')}`
          };
        }

        return { error: 'Grouping not supported - no state setters provided' };
      }

      case 'clear_grouping': {
        if (setGrouping) {
          setGrouping([]);
          return { success: true, message: 'Cleared all grouping' };
        } else if (table) {
          table.resetGrouping();
          return { success: true, message: 'Cleared all grouping' };
        }

        return { error: 'Grouping not supported - no state setters provided' };
      }

      case 'expand_row': {
        const { rowId, expanded: shouldExpand = true } = params;

        if (!rowId) {
          throw new Error('Row ID is required for expand/collapse');
        }

        if (setExpanded) {
          setExpanded((prev: ExpandedState) => {
            if (typeof prev === 'boolean') {
              return { [rowId]: shouldExpand };
            }
            return { ...prev, [rowId]: shouldExpand };
          });
          return {
            success: true,
            message: `${shouldExpand ? 'Expanded' : 'Collapsed'} row: ${rowId}`
          };
        } else if (table) {
          const row = table.getRow(rowId);
          if (row) {
            row.toggleExpanded(shouldExpand);
            return {
              success: true,
              message: `${shouldExpand ? 'Expanded' : 'Collapsed'} row: ${rowId}`
            };
          }
          return { error: `Row not found: ${rowId}` };
        }

        return { error: 'Row expansion not supported - no state setters provided' };
      }

      case 'expand_all': {
        const { expanded: shouldExpand = true } = params;

        if (setExpanded) {
          setExpanded(shouldExpand ? true : {});
          return {
            success: true,
            message: shouldExpand ? 'Expanded all rows' : 'Collapsed all rows'
          };
        } else if (table) {
          table.toggleAllRowsExpanded(shouldExpand);
          return {
            success: true,
            message: shouldExpand ? 'Expanded all rows' : 'Collapsed all rows'
          };
        }

        return { error: 'Row expansion not supported - no state setters provided' };
      }

      case 'sort': {
        const { sortBy, sortOrder = 'asc' } = params;

        if (!sortBy) {
          throw new Error('Column name is required for sorting');
        }

        if (setSorting) {
          setSorting([{ id: sortBy, desc: sortOrder === 'desc' }]);
          return {
            success: true,
            message: `Sorted by ${sortBy} (${sortOrder})`,
            current_sorting: sorting
          };
        } else if (table) {
          table.setSorting([{ id: sortBy, desc: sortOrder === 'desc' }]);
          return {
            success: true,
            message: `Sorted by ${sortBy} (${sortOrder})`
          };
        }

        return { error: 'Sorting not supported - no state setters provided' };
      }

      case 'search': {
        const { query } = params;

        if (!query) {
          throw new Error('Search query is required');
        }

        if (setGlobalFilter) {
          setGlobalFilter(query);
          return {
            success: true,
            message: `Searching for: "${query}"`,
            results_count: table ? table.getFilteredRowModel().rows.length : 'unknown'
          };
        } else if (table) {
          table.setGlobalFilter(query);
          return {
            success: true,
            message: `Searching for: "${query}"`,
            results_count: table.getFilteredRowModel().rows.length
          };
        }

        return { error: 'Search not supported - no state setters provided' };
      }

      case 'clear_search': {
        if (setGlobalFilter) {
          setGlobalFilter('');
          return { success: true, message: 'Cleared search' };
        } else if (table) {
          table.setGlobalFilter('');
          return { success: true, message: 'Cleared search' };
        }

        return { error: 'Search not supported - no state setters provided' };
      }

      case 'paginate': {
        const { page } = params;

        if (page === undefined) {
          throw new Error('Page number is required');
        }

        if (table) {
          if (page === -1) {
            table.lastPage();
          } else if (page === 0) {
            table.firstPage();
          } else {
            table.setPageIndex(page - 1); // Convert to 0-based index
          }
          return {
            success: true,
            message: `Navigated to page ${page}`,
            current_page: table.getState().pagination.pageIndex + 1,
            total_pages: table.getPageCount()
          };
        } else if (setPagination && pagination) {
          setPagination({ ...pagination, pageIndex: page - 1 });
          return {
            success: true,
            message: `Navigated to page ${page}`
          };
        }

        return { error: 'Pagination not supported - no table instance or state setters' };
      }

      case 'set_page_size': {
        const { pageSize } = params;

        if (!pageSize) {
          throw new Error('Page size is required');
        }

        if (table) {
          table.setPageSize(pageSize);
          return {
            success: true,
            message: `Set page size to ${pageSize}`,
            current_page_size: pageSize
          };
        } else if (setPagination && pagination) {
          setPagination({ ...pagination, pageSize });
          return {
            success: true,
            message: `Set page size to ${pageSize}`
          };
        }

        return { error: 'Pagination not supported - no table instance or state setters' };
      }

      case 'toggle_column': {
        const { columns, visible = true } = params;

        if (!columns || !Array.isArray(columns)) {
          throw new Error('Column names array is required');
        }

        if (setColumnVisibility) {
          const newVisibility = { ...columnVisibility };
          columns.forEach(col => {
            newVisibility[col] = visible;
          });
          setColumnVisibility(newVisibility);
          return {
            success: true,
            message: `${visible ? 'Showed' : 'Hid'} columns: ${columns.join(', ')}`
          };
        } else if (table) {
          columns.forEach(col => {
            table.getColumn(col)?.toggleVisibility(visible);
          });
          return {
            success: true,
            message: `${visible ? 'Showed' : 'Hid'} columns: ${columns.join(', ')}`
          };
        }

        return { error: 'Column visibility not supported - no state setters provided' };
      }

      case 'select': {
        const { id, index } = params;

        if (!onSelectItem) {
          return { error: 'Selection not supported for this table' };
        }

        let itemToSelect: T | null = null;

        if (index !== undefined && index >= 0 && index < data.length) {
          itemToSelect = data[index];
        } else if (id !== undefined) {
          const found = data.find((item) => getItemId(item) === id);
          if (found) itemToSelect = found;
        }

        if (itemToSelect) {
          onSelectItem(itemToSelect);
          return {
            success: true,
            selected: itemToSelect,
            message: `Selected: ${getItemDisplayName(itemToSelect)}`
          };
        } else {
          return { error: 'Item not found' };
        }
      }

      case 'clear_selection': {
        if (onSelectItem) {
          onSelectItem(null);
          return { success: true, message: 'Cleared selection' };
        }
        return { error: 'Selection not supported for this table' };
      }

      case 'get_state': {
        const state: Record<string, unknown> = {
          table: tableName,
          total_items: data.length,
          filtered_items: table ? table.getFilteredRowModel().rows.length : data.length,
          selected_item: selectedItem ? getItemDisplayName(selectedItem) : null,
          selected_id: selectedItem ? getItemId(selectedItem) : null,
        };

        if (table) {
          const tableState = table.getState();
          state.filters = tableState.columnFilters;
          state.sorting = tableState.sorting;
          state.grouping = tableState.grouping;
          state.expanded = tableState.expanded;
          state.global_filter = tableState.globalFilter;
          state.pagination = {
            page: tableState.pagination.pageIndex + 1,
            pageSize: tableState.pagination.pageSize,
            totalPages: table.getPageCount()
          };
          state.visible_columns = Object.entries(tableState.columnVisibility)
            .filter(([, visible]) => visible)
            .map(([col]) => col);
        } else {
          state.filters = columnFilters;
          state.sorting = sorting;
          state.grouping = grouping;
          state.expanded = expanded;
          state.global_filter = globalFilter;
          state.pagination = pagination;
          state.visible_columns = columnVisibility ?
            Object.entries(columnVisibility)
              .filter(([, visible]) => visible)
              .map(([col]) => col) :
            'all';
        }

        state.available_operations = availableOperations;
        state.searchable_fields = searchableFields;
        state.custom_actions = customActions ? Object.keys(customActions) : [];

        return state;
      }

      case 'reset': {
        if (table) {
          table.resetColumnFilters();
          table.resetSorting();
          table.resetGlobalFilter();
          table.resetGrouping();
          table.resetExpanded();
          table.setPageIndex(0);
        } else {
          if (setColumnFilters) setColumnFilters([]);
          if (setSorting) setSorting([]);
          if (setGlobalFilter) setGlobalFilter('');
          if (setGrouping) setGrouping([]);
          if (setExpanded) setExpanded({});
          if (setPagination && pagination) setPagination({ ...pagination, pageIndex: 0 });
        }
        if (onSelectItem) onSelectItem(null);

        return {
          success: true,
          message: 'Reset all filters, sorting, grouping, search, and selection'
        };
      }

      default: {
        // Check for custom actions
        if (customActions && customActions[operation]) {
          const { id, index } = params;

          let targetItem: T | null = null;
          if (index !== undefined && index >= 0 && index < data.length) {
            targetItem = data[index];
          } else if (id !== undefined) {
            const found = data.find((item) => getItemId(item) === id);
            if (found) targetItem = found;
          } else if (selectedItem) {
            targetItem = selectedItem;
          }

          if (!targetItem) {
            throw new Error('No item specified or selected for action');
          }

          const result = await customActions[operation].handler(targetItem);
          return {
            success: true,
            action: operation,
            item: targetItem,
            result
          };
        }

        throw new Error(`Unknown operation: ${operation}. Available: ${availableOperations.join(', ')}`);
      }
    }
  }, [data, tableName, selectedItem, onSelectItem, table, columnFilters, setColumnFilters, sorting, setSorting,
      globalFilter, setGlobalFilter, columnVisibility, setColumnVisibility, pagination, setPagination,
      grouping, setGrouping, expanded, setExpanded,
      customActions, searchableFields, getItemId, getItemDisplayName, availableOperations]);

  // Build the operation enum dynamically
  const operationEnum = useMemo(() => {
    const baseOps = [
      'filter_column', 'batch_filter', 'clear_filter',
      'group_by', 'clear_grouping', 'expand_row', 'expand_all',
      'sort', 'search', 'clear_search',
      'paginate', 'set_page_size', 'toggle_column', 'select', 'clear_selection',
      'get_state', 'reset'
    ] as const;

    if (customActions) {
      const customOps = Object.keys(customActions);
      if (customOps.length > 0) {
        return [...baseOps, ...customOps] as [string, ...string[]];
      }
    }
    return baseOps as typeof baseOps;
  }, [customActions]);

  // Register the powerful table tool
  useMCPTool({
    name: `table_${tableName}`,
    description: `Control and interact with the ${tableDescription} table UI.

This tool manipulates the actual UI state, so changes are immediately visible to the user.

AVAILABLE OPERATIONS:
${availableOperations.map(op => `• ${op}`).join('\n')}

EXAMPLES:

1. Filter a column with advanced filter types:
   { "operation": "filter_column", "column": "category", "value": "skill" }
   { "operation": "filter_column", "column": "importance_score", "value": 80, "filterType": "greaterThan" }
   { "operation": "filter_column", "column": "importance_score", "value": 50, "secondValue": 90, "filterType": "between" }
   { "operation": "filter_column", "column": "status", "value": "inactive", "filterType": "notEquals" }

2. Batch filtering (apply multiple filters at once):
   { "operation": "batch_filter", "filters": [
     { "column": "category", "value": "skill" },
     { "column": "importance_score", "value": 80, "filterType": "greaterThan" },
     { "column": "confidence", "value": 50, "secondValue": 100, "filterType": "between" }
   ]}

3. Clear filters:
   { "operation": "clear_filter", "column": "category" }  // Clear specific column
   { "operation": "clear_filter" }  // Clear all filters

4. Group by columns:
   { "operation": "group_by", "groupBy": "category" }  // Single column
   { "operation": "group_by", "groupBy": ["category", "status"] }  // Multiple columns
   { "operation": "clear_grouping" }  // Remove all grouping

5. Expand/collapse grouped rows:
   { "operation": "expand_row", "rowId": "category:skill", "expanded": true }
   { "operation": "expand_all", "expanded": true }  // Expand all
   { "operation": "expand_all", "expanded": false }  // Collapse all

6. Sort the table:
   { "operation": "sort", "sortBy": "created_at", "sortOrder": "desc" }

7. Search globally:
   { "operation": "search", "query": "typescript" }
   { "operation": "clear_search" }

8. Navigate pages:
   { "operation": "paginate", "page": 2 }
   { "operation": "set_page_size", "pageSize": 50 }

9. Toggle column visibility:
   { "operation": "toggle_column", "columns": ["created_at", "updated_at"], "visible": false }

10. Select an item:
   { "operation": "select", "id": "uuid-here" }
   { "operation": "select", "index": 0 }
   { "operation": "clear_selection" }

11. Get current state:
   { "operation": "get_state" }

12. Reset everything:
   { "operation": "reset" }

${customActions ? `13. Custom actions:
${Object.entries(customActions).map(([key]) =>
  `   { "operation": "${key}", "id": "uuid-here" }`
).join('\n')}` : ''}

All operations update the UI in real-time, providing immediate visual feedback to the user.`,
    inputSchema: {
      operation: z.enum(operationEnum).describe('The operation to perform'),

      // Filter operations
      column: z.string().optional().describe('Column name for filtering/sorting/grouping'),
      value: z.unknown().optional().describe('Filter value'),
      filterType: z.enum(['equals', 'contains', 'startsWith', 'endsWith', 'greaterThan', 'lessThan', 'between', 'notEquals', 'notContains'])
        .optional().describe('Type of filter to apply'),
      secondValue: z.unknown().optional().describe('Second value for between filter'),
      filters: z.array(z.object({
        column: z.string(),
        value: z.unknown(),
        filterType: z.string().optional(),
        secondValue: z.unknown().optional()
      })).optional().describe('Array of filters for batch filtering'),

      // Grouping operations
      groupBy: z.union([z.string(), z.array(z.string())]).optional().describe('Column(s) to group by'),
      rowId: z.string().optional().describe('Row ID for expand/collapse operations'),
      expanded: z.boolean().optional().describe('Whether to expand or collapse'),

      // Sort operations
      sortBy: z.string().optional().describe('Column to sort by'),
      sortOrder: z.enum(['asc', 'desc']).optional().describe('Sort direction'),

      // Pagination
      page: z.number().optional().describe('Page number (1-based)'),
      pageSize: z.number().optional().describe('Number of items per page'),

      // Search
      query: z.string().optional().describe('Global search query'),

      // Selection
      id: z.union([z.string(), z.number()]).optional().describe('ID of item to select/act on'),
      index: z.number().optional().describe('Index of item in current list (0-based)'),

      // Column visibility
      columns: z.array(z.string()).optional().describe('Column names to show/hide'),
      visible: z.boolean().optional().describe('Whether to show or hide columns'),
    },
    annotations: {
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    handler: handleOperation,
  });
}