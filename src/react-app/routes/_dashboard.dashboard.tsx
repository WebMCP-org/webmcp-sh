import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, Database, Network, Activity, Plus, Shield, PlusCircle, Edit, Trash2, Clock, Chrome } from 'lucide-react'
import { IconTrendingUp } from "@tabler/icons-react"
import { useLiveQuery, usePGlite } from '@electric-sql/pglite-react'
import { memory_blocks, memory_entities, entity_relationships, conversation_sessions } from '@/lib/db'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { TooltipProvider } from '@/components/ui/tooltip'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { tooltips } from '@/lib/tooltip-content'
import type { AuditLog } from '@/lib/db/types'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { highlightCode } from '@/lib/syntax-highlight'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MemoryBlockForm } from '@/components/forms/memory-block-form'
import { MemoryEntityForm } from '@/components/forms/memory-entity-form'
import { MemoryBlocksDataTable } from '@/components/data-tables/memory-blocks-data-table'
import { columns as memoryBlocksColumns } from '@/components/data-tables/memory-blocks-columns'
import { EntitiesDataTable } from '@/components/data-tables/entities-data-table'
import { columns as entitiesColumns } from '@/components/data-tables/entities-columns'
import type { MCPToolsConfig } from '@/types/mcp-tools'
import type { UpdateMemoryBlock } from '@/lib/db/types'
import { useMCPDashboardPrompts } from '@/hooks/prompts'

export const Route = createFileRoute('/_dashboard/dashboard')({
  component: DashboardHome,
})

// Chart colors
const ENTITY_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#14b8a6'];
const TIER_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#6b7280'];

function DashboardHome() {
  // Register MCP prompts for this page
  useMCPDashboardPrompts()

  const db = usePGlite();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedJson, setHighlightedJson] = useState<{ [key: string]: { old?: string; new?: string } }>({});
  const offsetRef = useRef(0);
  const PAGE_SIZE = 10;

  // Memory blocks state
  const [isCreateBlockDialogOpen, setIsCreateBlockDialogOpen] = useState(false)
  const [isEditBlockDialogOpen, setIsEditBlockDialogOpen] = useState(false)
  const [isDuplicateBlockDialogOpen, setIsDuplicateBlockDialogOpen] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<memory_blocks.GetAllMemoryBlocksResult | null>(null)
  const [editingBlock, setEditingBlock] = useState<memory_blocks.GetAllMemoryBlocksResult | null>(null)
  const [duplicateBlockData, setDuplicateBlockData] = useState<UpdateMemoryBlock | null>(null)

  // Entities state
  const [isCreateEntityDialogOpen, setIsCreateEntityDialogOpen] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<memory_entities.GetAllMemoryEntitiesResult | null>(null)

  // Get counts
  const blocksQuery = memory_blocks.getMemoryBlocksCountQuerySQL();
  const entitiesQuery = memory_entities.getMemoryEntitiesCountQuerySQL();
  const relationshipsQuery = entity_relationships.getEntityRelationshipsCountQuerySQL();
  const sessionsQuery = conversation_sessions.getConversationSessionsCountQuerySQL();

  // Token-based queries
  const categoryTokensQuery = memory_entities.getMemoryEntityTokensByCategoryQuerySQL();
  const tierTokensQuery = memory_entities.getMemoryEntityTokensByTierQuerySQL();
  const blockTypeTokensQuery = memory_blocks.getMemoryBlockTokensByTypeQuerySQL();

  const memoryBlocksResult = useLiveQuery<memory_blocks.GetMemoryBlocksCountResult>(blocksQuery.sql, blocksQuery.params);
  const memoryEntitiesResult = useLiveQuery<memory_entities.GetMemoryEntitiesCountResult>(entitiesQuery.sql, entitiesQuery.params);
  const relationshipsResult = useLiveQuery<entity_relationships.GetEntityRelationshipsCountResult>(relationshipsQuery.sql, relationshipsQuery.params);
  const sessionsResult = useLiveQuery<conversation_sessions.GetConversationSessionsCountResult>(sessionsQuery.sql, sessionsQuery.params);

  // Token-based results
  const categoryTokensResult = useLiveQuery<memory_entities.GetMemoryEntityTokensByCategoryResult>(categoryTokensQuery.sql, categoryTokensQuery.params);
  const tierTokensResult = useLiveQuery<memory_entities.GetMemoryEntityTokensByTierResult>(tierTokensQuery.sql, tierTokensQuery.params);
  const blockTypeTokensResult = useLiveQuery<memory_blocks.GetMemoryBlockTokensByTypeResult>(blockTypeTokensQuery.sql, blockTypeTokensQuery.params);

  // Data for tables
  const allBlocksQuery = memory_blocks.getAllMemoryBlocksQuerySQL()
  const blocksDataResult = useLiveQuery<memory_blocks.GetAllMemoryBlocksResult>(allBlocksQuery.sql, allBlocksQuery.params)
  const blocksData = blocksDataResult?.rows ?? []

  const allEntitiesQuery = memory_entities.getAllMemoryEntitiesQuerySQL()
  const entitiesDataResult = useLiveQuery<memory_entities.GetAllMemoryEntitiesResult>(allEntitiesQuery.sql, allEntitiesQuery.params)
  const entitiesData = entitiesDataResult?.rows ?? []

  const blockCount = memoryBlocksResult?.rows?.[0]?.count ?? 0;
  const entityCount = memoryEntitiesResult?.rows?.[0]?.count ?? 0;
  const relationshipCount = relationshipsResult?.rows?.[0]?.count ?? 0;
  const sessionCount = sessionsResult?.rows?.[0]?.count ?? 0;

  // Token data
  const categoryTokensData = categoryTokensResult?.rows ?? [];
  const tierTokensData = tierTokensResult?.rows ?? [];
  const blockTypeTokensData = blockTypeTokensResult?.rows ?? [];

  // Calculate total tokens (memoized — two .reduce() calls)
  const totalTokens = useMemo(() => {
    const entityTokens = categoryTokensData.reduce((sum, item) => {
      const tokens = Number(item.total_tokens);
      return sum + (isNaN(tokens) ? 0 : tokens);
    }, 0);
    const blockTokens = blockTypeTokensData.reduce((sum, item) => {
      const tokens = Number(item.total_tokens);
      return sum + (isNaN(tokens) ? 0 : tokens);
    }, 0);
    return entityTokens + blockTokens;
  }, [categoryTokensData, blockTypeTokensData]);

  // Prepare chart data (memoized to avoid recomputation on unrelated re-renders)
  const categoryChartData = useMemo(() =>
    categoryTokensData
      .map((item, idx) => ({
        name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
        value: Number(item.total_tokens) || 0,
        count: Number(item.count) || 0,
        color: ENTITY_COLORS[idx % ENTITY_COLORS.length]
      }))
      .filter(item => item.value > 0),
    [categoryTokensData]
  );

  const tierChartData = useMemo(() =>
    tierTokensData
      .map((item, idx) => ({
        name: item.memory_tier.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        value: Number(item.total_tokens) || 0,
        count: Number(item.count) || 0,
        color: TIER_COLORS[idx % TIER_COLORS.length]
      }))
      .filter(item => item.value > 0),
    [tierTokensData]
  );

  // MCP Tools configuration for Memory Blocks (memoized to prevent DataTable re-renders)
  const memoryBlocksMcpConfig: MCPToolsConfig<memory_blocks.GetAllMemoryBlocksResult> = useMemo(() => ({
    tableName: 'memory_blocks',
    tableDescription: 'Always-in-context memory blocks that are core to the AI system',
    selectedItem: selectedBlock,
    onSelectItem: setSelectedBlock,
    searchableFields: ['value', 'label'],
    getItemId: (item: memory_blocks.GetAllMemoryBlocksResult) => item.id,
    getItemDisplayName: (item: memory_blocks.GetAllMemoryBlocksResult) => `${item.block_type}: ${item.label || item.value.substring(0, 30)}`,
    customActions: {
      edit_block: {
        description: 'Open the edit dialog for this memory block',
        handler: async (item) => {
          setEditingBlock(item)
          setIsEditBlockDialogOpen(true)
          return `Opening edit dialog for ${item.label}`
        }
      },
      duplicate_block: {
        description: 'Open the create dialog with pre-filled data from this block',
        handler: async (item) => {
          setDuplicateBlockData({
            block_type: item.block_type,
            value: item.value,
            label: `${item.label} (Copy)`,
            priority: item.priority,
            char_limit: item.char_limit,
            metadata: item.metadata
          } as UpdateMemoryBlock)
          setIsDuplicateBlockDialogOpen(true)
          return `Opening duplicate dialog for ${item.label}`
        }
      },
    }
  }), [selectedBlock]);

  // MCP Tools configuration for Entities (memoized)
  const entitiesMcpConfig: MCPToolsConfig<memory_entities.GetAllMemoryEntitiesResult> = useMemo(() => ({
    tableName: 'entities',
    tableDescription: 'Structured knowledge entities (facts, preferences, skills, people, projects, goals)',
    selectedItem: selectedEntity,
    onSelectItem: setSelectedEntity,
    searchableFields: ['name', 'description', 'tags'],
    getItemId: (item: memory_entities.GetAllMemoryEntitiesResult) => item.id,
    getItemDisplayName: (item: memory_entities.GetAllMemoryEntitiesResult) => `${item.name} (${item.category})`,
    customActions: {}
  }), [selectedEntity]);

  // Load initial audit logs and check if we need to load more to fill the container
  useEffect(() => {
    const loadInitial = async () => {
      await loadMoreAuditLogs();
      setTimeout(() => {
        const container = document.querySelector('.audit-log-container') as HTMLDivElement;
        if (container && container.scrollHeight <= container.clientHeight && hasMore) {
          loadMoreAuditLogs();
        }
      }, 100);
    };
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Highlight JSON data for audit logs
  // Use functional setState to avoid highlightedJson in dependency array (prevents re-run loop)
  useEffect(() => {
    if (auditLogs.length === 0) return;

    const highlightAuditLogJson = async () => {
      for (const log of auditLogs) {
        // Use functional update to check existing state without subscribing to it
        let alreadyHighlighted = false;
        setHighlightedJson(prev => {
          if (prev[log.id]) alreadyHighlighted = true;
          return prev;
        });
        if (alreadyHighlighted) continue;

        const highlighted: { old?: string; new?: string } = {};
        if (log.old_data) {
          try {
            const oldJson = JSON.stringify(log.old_data, null, 2);
            highlighted.old = await highlightCode(oldJson, 'json');
          } catch { /* ignore */ }
        }
        if (log.new_data) {
          try {
            const newJson = JSON.stringify(log.new_data, null, 2);
            highlighted.new = await highlightCode(newJson, 'json');
          } catch { /* ignore */ }
        }
        if (highlighted.old || highlighted.new) {
          setHighlightedJson(prev => ({ ...prev, [log.id]: highlighted }));
        }
      }
    };
    highlightAuditLogJson();
  }, [auditLogs]);

  // Use refs for loading/hasMore to stabilize callback identity (rerender-functional-setstate)
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  // Function to load more audit logs (stable identity — no state in deps)
  const loadMoreAuditLogs = useCallback(async () => {
    if (isLoadingRef.current || !hasMoreRef.current) return;
    const currentOffset = offsetRef.current;
    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const tableCheck = await db.query<{ exists: boolean }>(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'audit_log'
        ) as exists;
      `);
      if (!tableCheck.rows[0]?.exists) {
        hasMoreRef.current = false;
        setHasMore(false);
        isLoadingRef.current = false;
        setIsLoading(false);
        return;
      }
      const result = await db.query<AuditLog>(`
        SELECT id, operation, table_name, record_id, old_data, new_data, changed_fields, operation_type, session_id, timestamp
        FROM audit_log ORDER BY timestamp DESC LIMIT $1 OFFSET $2
      `, [PAGE_SIZE, currentOffset]);
      const newLogs = result.rows;
      setAuditLogs(prev => [...prev, ...newLogs]);
      offsetRef.current = currentOffset + newLogs.length;
      if (newLogs.length < PAGE_SIZE) {
        hasMoreRef.current = false;
        setHasMore(false);
      }
    } catch {
      hasMoreRef.current = false;
      setHasMore(false);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [db]);

  // Handle scroll for infinite loading (stable identity)
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const distanceFromBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    if (distanceFromBottom < 200 && !isLoadingRef.current && hasMoreRef.current) {
      loadMoreAuditLogs();
    }
  }, [loadMoreAuditLogs]);

  // Count by operation type (single pass instead of 3 separate .filter() calls)
  const { insertCount, updateCount, deleteCount } = useMemo(() => {
    let insert = 0, update = 0, del = 0;
    for (const e of auditLogs) {
      if (e.operation === 'INSERT') insert++;
      else if (e.operation === 'UPDATE') update++;
      else if (e.operation === 'DELETE') del++;
    }
    return { insertCount: insert, updateCount: update, deleteCount: del };
  }, [auditLogs]);

  return (
    <TooltipProvider>
      <div className="@container/main flex flex-1 flex-col min-w-0 gap-2 overflow-auto p-4 md:gap-4 md:p-6">
        {/* Stats Cards Row */}
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-2 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:grid-cols-5">
          <Card className="@container/card">
            <CardHeader>
              <CardDescription className="flex items-center gap-1">
                <Brain className="h-3.5 w-3.5" />
                Memory Blocks
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {blockCount}
              </CardTitle>
              <CardAction>
                <InfoTooltip content={tooltips.stats.memoryBlocks} />
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="text-muted-foreground">Core memories</div>
            </CardFooter>
          </Card>

          <Card className="@container/card">
            <CardHeader>
              <CardDescription className="flex items-center gap-1">
                <Database className="h-3.5 w-3.5" />
                Entities
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {entityCount}
              </CardTitle>
              <CardAction>
                <InfoTooltip content={tooltips.stats.entities} />
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="text-muted-foreground">Knowledge items</div>
            </CardFooter>
          </Card>

          <Card className="@container/card">
            <CardHeader>
              <CardDescription className="flex items-center gap-1">
                <Network className="h-3.5 w-3.5" />
                Relations
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {relationshipCount}
              </CardTitle>
              <CardAction>
                <InfoTooltip content={tooltips.stats.relations} />
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="text-muted-foreground">Connections</div>
            </CardFooter>
          </Card>

          <Card className="@container/card">
            <CardHeader>
              <CardDescription className="flex items-center gap-1">
                <Activity className="h-3.5 w-3.5" />
                Sessions
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {sessionCount}
              </CardTitle>
              <CardAction>
                <InfoTooltip content={tooltips.stats.sessions} />
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="text-muted-foreground">Conversations</div>
            </CardFooter>
          </Card>

          <Card className="@container/card col-span-2 lg:col-span-1">
            <CardHeader>
              <CardDescription className="flex items-center gap-1">
                <Brain className="h-3.5 w-3.5" />
                Total Tokens
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {totalTokens.toLocaleString()}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <IconTrendingUp className="h-3 w-3" />
                  {totalTokens > 0 ? `${((totalTokens / 200000) * 100).toFixed(1)}%` : '0%'}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="text-muted-foreground">of 200K budget</div>
            </CardFooter>
          </Card>
        </div>

        {/* Main Content Area with Tabs for Tables */}
        <Tabs defaultValue="overview" className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="memory-blocks">
                Memory Blocks <Badge variant="secondary" className="ml-1">{blockCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="entities">
                Entities <Badge variant="secondary" className="ml-1">{entityCount}</Badge>
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                <a href="https://chromewebstore.google.com/detail/mcp-b-extension/daohopfhkdelnpemnhlekblhnikhdhfa" target="_blank" rel="noopener noreferrer">
                  <Chrome className="h-3.5 w-3.5 mr-1" />
                  Extension
                </a>
              </Button>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="flex-1 grid gap-4 lg:grid-cols-12">
            {/* Charts Column */}
            <div className="lg:col-span-8 grid gap-4 md:grid-cols-2">
              {/* Entity Categories Chart */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Tokens by Category</CardTitle>
                  <CardDescription>Memory usage by entity type</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center min-h-[200px]">
                  {categoryChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius="50%"
                          outerRadius="70%"
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                            fontSize: '11px'
                          }}
                          formatter={(value: number, _name: string, props) => [
                            `${value.toLocaleString()} tokens (${props.payload.count} items)`,
                            props.payload.name
                          ]}
                        />
                        <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-sm text-muted-foreground">No entities yet</div>
                  )}
                </CardContent>
              </Card>

              {/* Memory Tiers Chart */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Tokens by Memory Tier</CardTitle>
                  <CardDescription>Short-term vs long-term usage</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center min-h-[200px]">
                  {tierChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={tierChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius="50%"
                          outerRadius="70%"
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {tierChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                            fontSize: '11px'
                          }}
                          formatter={(value: number, _name: string, props) => [
                            `${value.toLocaleString()} tokens (${props.payload.count} items)`,
                            props.payload.name
                          ]}
                        />
                        <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-sm text-muted-foreground">No tier data</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Audit Log Column */}
            <div className="lg:col-span-4">
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      Audit Log
                    </CardTitle>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-green-600 border-green-200 text-xs h-5 px-1.5">
                        <PlusCircle className="h-2.5 w-2.5 mr-0.5" />{insertCount}
                      </Badge>
                      <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs h-5 px-1.5">
                        <Edit className="h-2.5 w-2.5 mr-0.5" />{updateCount}
                      </Badge>
                      <Badge variant="outline" className="text-red-600 border-red-200 text-xs h-5 px-1.5">
                        <Trash2 className="h-2.5 w-2.5 mr-0.5" />{deleteCount}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>Protected database changes</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 overflow-hidden">
                  <div className="h-full max-h-[400px] overflow-y-auto audit-log-container" onScroll={handleScroll}>
                    {auditLogs.length > 0 ? (
                      <div className="space-y-2">
                        {auditLogs.map((entry) => {
                          let iconBgColor = 'bg-green-500/10';
                          let iconColor = 'text-green-600';
                          let borderColor = 'border-green-500/20';
                          let icon = <PlusCircle className="h-3.5 w-3.5" />;

                          if (entry.operation === 'UPDATE') {
                            icon = <Edit className="h-3.5 w-3.5" />;
                            iconBgColor = 'bg-blue-500/10';
                            iconColor = 'text-blue-600';
                            borderColor = 'border-blue-500/20';
                          } else if (entry.operation === 'DELETE') {
                            icon = <Trash2 className="h-3.5 w-3.5" />;
                            iconBgColor = 'bg-red-500/10';
                            iconColor = 'text-red-600';
                            borderColor = 'border-red-500/20';
                          }

                          const tooltipContent = (
                            <div className="space-y-3">
                              <div>
                                <p className="font-semibold">Operation Details</p>
                                <div className="text-sm font-medium">{entry.operation} on {entry.table_name}</div>
                                <p className="text-muted-foreground">Record ID: {entry.record_id}</p>
                              </div>
                              {entry.old_data && (
                                <div>
                                  <p className="font-semibold">Old Data</p>
                                  <div className="text-xs bg-slate-800 p-2 rounded overflow-auto max-h-32 border border-slate-700">
                                    {highlightedJson[entry.id]?.old ? (
                                      <div className="[&_pre]:bg-transparent [&_pre]:m-0 [&_pre]:p-0 [&_code]:text-xs" dangerouslySetInnerHTML={{ __html: highlightedJson[entry.id].old || '' }} />
                                    ) : (
                                      <pre className="text-slate-300">{JSON.stringify(entry.old_data, null, 2)}</pre>
                                    )}
                                  </div>
                                </div>
                              )}
                              {entry.new_data && (
                                <div>
                                  <p className="font-semibold">New Data</p>
                                  <div className="text-xs bg-slate-800 p-2 rounded overflow-auto max-h-32 border border-slate-700">
                                    {highlightedJson[entry.id]?.new ? (
                                      <div className="[&_pre]:bg-transparent [&_pre]:m-0 [&_pre]:p-0 [&_code]:text-xs" dangerouslySetInnerHTML={{ __html: highlightedJson[entry.id].new || '' }} />
                                    ) : (
                                      <pre className="text-slate-300">{JSON.stringify(entry.new_data, null, 2)}</pre>
                                    )}
                                  </div>
                                </div>
                              )}
                              <p className="text-muted-foreground pt-2 border-t border-slate-600">
                                {new Date(entry.timestamp).toLocaleString()}
                              </p>
                            </div>
                          );

                          return (
                            <div
                              key={entry.id}
                              className={`flex items-start gap-3 p-3 rounded-lg border ${borderColor} bg-card hover:shadow-md transition-shadow duration-200 cursor-pointer relative group`}
                            >
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full ${iconBgColor} ${iconColor} flex items-center justify-center`}>
                                {icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium truncate">
                                  {entry.operation} on {entry.table_name}
                                </div>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <Badge variant="outline" className={`text-xs h-5 px-1.5 ${iconColor} font-mono`}>
                                    {entry.record_id.substring(0, 6)}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              </div>
                              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <InfoTooltip content={tooltipContent} side="left" maxWidth="450px" />
                              </div>
                            </div>
                          );
                        })}
                        {isLoading && (
                          <div className="text-center py-2 text-xs text-muted-foreground">Loading more...</div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                        <Shield className="h-8 w-8 mb-2 opacity-20" />
                        <div className="text-sm">No audit entries yet</div>
                        <div className="text-xs mt-1">Changes will appear here</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Memory Blocks Tab */}
          <TabsContent value="memory-blocks" className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Memory Blocks
                </h2>
                <p className="text-sm text-muted-foreground">Always-in-context memory</p>
              </div>
              <Dialog open={isCreateBlockDialogOpen} onOpenChange={setIsCreateBlockDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700">
                    <Plus className="h-3 w-3 mr-1" />
                    Create
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
                  <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle>Create Memory Block</DialogTitle>
                    <DialogDescription>Add a new always-in-context memory block.</DialogDescription>
                  </DialogHeader>
                  <div className="overflow-y-auto px-6 py-4">
                    <MemoryBlockForm onSuccess={() => setIsCreateBlockDialogOpen(false)} onCancel={() => setIsCreateBlockDialogOpen(false)} />
                  </div>
                </DialogContent>
              </Dialog>

              {/* Edit Dialog */}
              <Dialog open={isEditBlockDialogOpen} onOpenChange={setIsEditBlockDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
                  <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle>Edit Memory Block</DialogTitle>
                    <DialogDescription>Update the details of this memory block.</DialogDescription>
                  </DialogHeader>
                  <div className="overflow-y-auto px-6 py-4">
                    {editingBlock && (
                      <MemoryBlockForm
                        block={{ id: editingBlock.id, block_type: editingBlock.block_type, label: editingBlock.label, value: editingBlock.value, priority: editingBlock.priority, char_limit: editingBlock.char_limit, metadata: editingBlock.metadata }}
                        onSuccess={() => { setIsEditBlockDialogOpen(false); setEditingBlock(null); }}
                        onCancel={() => { setIsEditBlockDialogOpen(false); setEditingBlock(null); }}
                      />
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Duplicate Dialog */}
              <Dialog open={isDuplicateBlockDialogOpen} onOpenChange={setIsDuplicateBlockDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
                  <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle>Duplicate Memory Block</DialogTitle>
                    <DialogDescription>Create a new block based on an existing one.</DialogDescription>
                  </DialogHeader>
                  <div className="overflow-y-auto px-6 py-4">
                    {duplicateBlockData && (
                      <MemoryBlockForm
                        block={duplicateBlockData}
                        onSuccess={() => { setIsDuplicateBlockDialogOpen(false); setDuplicateBlockData(null); }}
                        onCancel={() => { setIsDuplicateBlockDialogOpen(false); setDuplicateBlockData(null); }}
                      />
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex-1 overflow-auto">
              <MemoryBlocksDataTable columns={memoryBlocksColumns} data={blocksData} mcpTools={memoryBlocksMcpConfig} />
            </div>
          </TabsContent>

          {/* Entities Tab */}
          <TabsContent value="entities" className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Entities
                </h2>
                <p className="text-sm text-muted-foreground">Structured knowledge</p>
              </div>
              <Dialog open={isCreateEntityDialogOpen} onOpenChange={setIsCreateEntityDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700">
                    <Plus className="h-3 w-3 mr-1" />
                    Create
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
                  <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle>Create Memory Entity</DialogTitle>
                    <DialogDescription>Add a new structured piece of knowledge.</DialogDescription>
                  </DialogHeader>
                  <div className="overflow-y-auto px-6 py-4">
                    <MemoryEntityForm onSuccess={() => setIsCreateEntityDialogOpen(false)} onCancel={() => setIsCreateEntityDialogOpen(false)} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex-1 overflow-auto">
              <EntitiesDataTable columns={entitiesColumns} data={entitiesData} mcpTools={entitiesMcpConfig} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
