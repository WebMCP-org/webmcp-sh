"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  ExpandedState,
  GroupingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  useReactTable,
  FilterFn,
  Row,
} from "@tanstack/react-table"
import { rankItem } from "@tanstack/match-sorter-utils"
import { ChevronDown, Search, Group, X, SlidersHorizontal } from "lucide-react"
import { useMCPTableTools, type TableToolsConfig } from "@/hooks/useMCPTableTools"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Define fuzzy filter
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

interface DataTableProps<TData extends Record<string, unknown>, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  renderExpandedRow?: (row: Row<TData>) => React.ReactNode
  defaultColumnVisibility?: VisibilityState
  // MCP Table Tools configuration
  mcpTools: Omit<TableToolsConfig<TData>, 'data' | 'table' | 'columnFilters' | 'setColumnFilters' |
    'sorting' | 'setSorting' | 'globalFilter' | 'setGlobalFilter' |
    'columnVisibility' | 'setColumnVisibility' | 'pagination' | 'setPagination'>
}

export function DataTable<TData extends Record<string, unknown>, TValue>({
  columns,
  data,
  renderExpandedRow,
  defaultColumnVisibility = {},
  mcpTools,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(defaultColumnVisibility)
  const [expanded, setExpanded] = React.useState<ExpandedState>({})
  const [grouping, setGrouping] = React.useState<GroupingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      expanded,
      grouping,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,
    onGroupingChange: setGrouping,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getRowCanExpand: () => true, // Allow all rows to expand
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
  })

  const groupableColumns = table
    .getAllColumns()
    .filter((column) => column.getCanGroup())

  // Register MCP Table Tools (hook can handle undefined)
  useMCPTableTools({
    ...mcpTools,
    data,
    table,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
    globalFilter,
    setGlobalFilter,
    columnVisibility,
    setColumnVisibility,
    pagination: table.getState().pagination,
    setPagination: (updater) => {
      const newPagination = typeof updater === 'function'
        ? updater(table.getState().pagination)
        : updater;
      table.setPagination(newPagination);
    },
  })

  return (
    <div className="space-y-4">
      {/* Global Search and Controls */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Fuzzy search across all columns..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>

        {/* Group By Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Group className="h-4 w-4 mr-2" />
              Group {grouping.length > 0 && `(${grouping.length})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Group by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {groupableColumns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsGrouped()}
                onCheckedChange={(value) => {
                  if (value) {
                    setGrouping([...grouping, column.id])
                  } else {
                    setGrouping(grouping.filter((g) => g !== column.id))
                  }
                }}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
            {grouping.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => setGrouping([])}
                >
                  Clear grouping
                </Button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Columns Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters Display */}
      {(columnFilters.length > 0 || globalFilter) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground">
            Active filters:
          </span>
          {globalFilter && (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary text-xs">
              <span>Global: {globalFilter}</span>
              <button
                onClick={() => setGlobalFilter("")}
                className="hover:bg-primary/20 rounded p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {columnFilters.map((filter) => (
            <div
              key={filter.id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted text-muted-foreground text-xs"
            >
              <span className="capitalize">{filter.id}: </span>
              <span className="font-medium">
                {typeof filter.value === 'string' ? filter.value : JSON.stringify(filter.value)}
              </span>
              <button
                onClick={() => {
                  table.getColumn(filter.id)?.setFilterValue(undefined)
                }}
                className="hover:bg-accent rounded p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setColumnFilters([])
              setGlobalFilter("")
            }}
            className="text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Grouping Display */}
      {grouping.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Group className="h-4 w-4" />
          <span>Grouped by:</span>
          {grouping.map((group, index) => (
            <span key={group} className="capitalize font-medium">
              {group}
              {index < grouping.length - 1 && " → "}
            </span>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {cell.getIsGrouped() ? (
                          // Grouped cell
                          <div className="flex items-center gap-2">
                            <button
                              onClick={row.getToggleExpandedHandler()}
                              className="cursor-pointer"
                            >
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${
                                  row.getIsExpanded() ? "" : "-rotate-90"
                                }`}
                              />
                            </button>
                            <span className="font-medium">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}{" "}
                              ({row.subRows.length})
                            </span>
                          </div>
                        ) : cell.getIsAggregated() ? (
                          // Aggregated cell
                          flexRender(
                            cell.column.columnDef.aggregatedCell ??
                              cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        ) : cell.getIsPlaceholder() ? null : (
                          // Normal cell
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        )}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Expanded Row Details */}
                  {row.getIsExpanded() && !row.getIsGrouped() && renderExpandedRow && (
                    <TableRow>
                      <TableCell colSpan={row.getVisibleCells().length} className="bg-muted">
                        {renderExpandedRow(row)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} row(s)
          {table.getFilteredRowModel().rows.length !== data.length &&
            ` (filtered from ${data.length})`}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
