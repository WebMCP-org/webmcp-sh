import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, Database, Network, Activity, Chrome, Clock, Shield, PlusCircle, Edit, Trash2 } from 'lucide-react'
import { useLiveQuery, usePGlite } from '@electric-sql/pglite-react'
import { memory_blocks, memory_entities, entity_relationships, conversation_sessions } from '@/lib/db'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { motion } from "motion/react"
import { TooltipProvider } from '@/components/ui/tooltip'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { tooltips } from '@/lib/tooltip-content'
import type { AuditLog } from '@/lib/db/schema'
import { useState, useEffect, useCallback, useRef } from 'react'
import { highlightCode } from '@/lib/syntax-highlight'

export const Route = createFileRoute('/_dashboard/')({
  component: DashboardHome,
})

const ENTITY_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#14b8a6'];
const TIER_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#6b7280'];

function DashboardHome() {
  const db = usePGlite();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedJson, setHighlightedJson] = useState<{ [key: string]: { old?: string; new?: string } }>({});
  const offsetRef = useRef(0);
  const PAGE_SIZE = 10;

  const blocksQuery = memory_blocks.getMemoryBlocksCountQuerySQL();
  const entitiesQuery = memory_entities.getMemoryEntitiesCountQuerySQL();
  const relationshipsQuery = entity_relationships.getEntityRelationshipsCountQuerySQL();
  const sessionsQuery = conversation_sessions.getConversationSessionsCountQuerySQL();

  const categoryTokensQuery = memory_entities.getMemoryEntityTokensByCategoryQuerySQL();
  const tierTokensQuery = memory_entities.getMemoryEntityTokensByTierQuerySQL();
  const blockTypeTokensQuery = memory_blocks.getMemoryBlockTokensByTypeQuerySQL();

  const memoryBlocksResult = useLiveQuery<memory_blocks.GetMemoryBlocksCountResult>(blocksQuery.sql, blocksQuery.params);
  const memoryEntitiesResult = useLiveQuery<memory_entities.GetMemoryEntitiesCountResult>(entitiesQuery.sql, entitiesQuery.params);
  const relationshipsResult = useLiveQuery<entity_relationships.GetEntityRelationshipsCountResult>(relationshipsQuery.sql, relationshipsQuery.params);
  const sessionsResult = useLiveQuery<conversation_sessions.GetConversationSessionsCountResult>(sessionsQuery.sql, sessionsQuery.params);

  const categoryTokensResult = useLiveQuery<memory_entities.GetMemoryEntityTokensByCategoryResult>(categoryTokensQuery.sql, categoryTokensQuery.params);
  const tierTokensResult = useLiveQuery<memory_entities.GetMemoryEntityTokensByTierResult>(tierTokensQuery.sql, tierTokensQuery.params);
  const blockTypeTokensResult = useLiveQuery<memory_blocks.GetMemoryBlockTokensByTypeResult>(blockTypeTokensQuery.sql, blockTypeTokensQuery.params);

  const blockCount = memoryBlocksResult?.rows?.[0]?.count ?? 0;
  const entityCount = memoryEntitiesResult?.rows?.[0]?.count ?? 0;
  const relationshipCount = relationshipsResult?.rows?.[0]?.count ?? 0;
  const sessionCount = sessionsResult?.rows?.[0]?.count ?? 0;

  const categoryTokensData = categoryTokensResult?.rows ?? [];
  const tierTokensData = tierTokensResult?.rows ?? [];
  const blockTypeTokensData = blockTypeTokensResult?.rows ?? [];
  const totalEntityTokens = categoryTokensData.reduce((sum, item) => {
    const tokens = Number(item.total_tokens);
    return sum + (isNaN(tokens) ? 0 : tokens);
  }, 0);
  const totalBlockTokens = blockTypeTokensData.reduce((sum, item) => {
    const tokens = Number(item.total_tokens);
    return sum + (isNaN(tokens) ? 0 : tokens);
  }, 0);
  const totalTokens = totalEntityTokens + totalBlockTokens;

  const categoryChartData = categoryTokensData
    .map((item, idx) => ({
      name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
      value: Number(item.total_tokens) || 0,
      count: Number(item.count) || 0,
      color: ENTITY_COLORS[idx % ENTITY_COLORS.length]
    }))
    .filter(item => item.value > 0);

  const tierChartData = tierTokensData
    .map((item, idx) => ({
      name: item.memory_tier.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      value: Number(item.total_tokens) || 0,
      count: Number(item.count) || 0,
      color: TIER_COLORS[idx % TIER_COLORS.length]
    }))
    .filter(item => item.value > 0);

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
  }, []);

  useEffect(() => {
    const highlightAuditLogJson = async () => {
      for (const log of auditLogs) {
        if (!highlightedJson[log.id]) {
          const highlighted: { old?: string; new?: string } = {};

          if (log.old_data) {
            try {
              const oldJson = JSON.stringify(log.old_data, null, 2);
              highlighted.old = await highlightCode(oldJson, 'json');
            } catch (error) {
              console.error('Error highlighting old data:', error);
            }
          }

          if (log.new_data) {
            try {
              const newJson = JSON.stringify(log.new_data, null, 2);
              highlighted.new = await highlightCode(newJson, 'json');
            } catch (error) {
              console.error('Error highlighting new data:', error);
            }
          }

          if (highlighted.old || highlighted.new) {
            setHighlightedJson(prev => ({ ...prev, [log.id]: highlighted }));
          }
        }
      }
    };

    if (auditLogs.length > 0) {
      highlightAuditLogJson();
    }
  }, [auditLogs, highlightedJson]);

  const loadMoreAuditLogs = useCallback(async () => {
    if (isLoading || !hasMore) {
      return;
    }

    const currentOffset = offsetRef.current;
    setIsLoading(true);
    try {
      const tableCheck = await db.query<{ exists: boolean }>(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'audit_log'
        ) as exists;
      `);

      if (!tableCheck.rows[0]?.exists) {
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      const result = await db.query<AuditLog>(`
        SELECT
          id,
          operation,
          table_name,
          record_id,
          old_data,
          new_data,
          changed_fields,
          operation_type,
          session_id,
          timestamp
        FROM audit_log
        ORDER BY timestamp DESC
        LIMIT $1 OFFSET $2
      `, [PAGE_SIZE, currentOffset]);

      const newLogs = result.rows;

      setAuditLogs(prev => [...prev, ...newLogs]);

      offsetRef.current = currentOffset + newLogs.length;

      if (newLogs.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [db, isLoading, hasMore, PAGE_SIZE]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < 200 && !isLoading && hasMore) {
      loadMoreAuditLogs();
    }
  }, [isLoading, hasMore, loadMoreAuditLogs]);
  const insertCount = auditLogs.filter(e => e.operation === 'INSERT').length;
  const updateCount = auditLogs.filter(e => e.operation === 'UPDATE').length;
  const deleteCount = auditLogs.filter(e => e.operation === 'DELETE').length;

  return (
    <TooltipProvider>
    <div className="flex flex-col h-full bg-background">
      <div className="flex-shrink-0 border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">WebMCP Memory</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              SQL-first AI memory · No embeddings
              <InfoTooltip content={tooltips.technical.sqlFirst} side="right" />
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="https://mcp-b.ai" target="_blank" rel="noopener noreferrer" className="text-xs">
                MCP-B.AI
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://chromewebstore.google.com/detail/mcp-b-extension/daohopfhkdelnpemnhlekblhnikhdhfa?pli=1" target="_blank" rel="noopener noreferrer" className="text-xs">
                <Chrome className="h-3 w-3 mr-1" />
                Extension
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 p-4 pb-2">
          <div className="grid grid-cols-5 gap-3">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <Card className="p-0 card-gradient-blue overflow-hidden relative hover:shadow-xl transition-all duration-300 border-blue-200">
                  <motion.div
                    className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <CardHeader className="p-3 pb-2 relative">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-medium text-chart-2 flex items-center gap-1">
                        Memory Blocks
                        <InfoTooltip content={tooltips.stats.memoryBlocks} />
                      </CardTitle>
                      <Brain className="h-4 w-4 text-chart-2" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 relative">
                    <div className="text-2xl font-bold">{blockCount}</div>
                    <p className="text-xs text-muted-foreground">Core memories</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <Card className="p-0 card-gradient-purple relative overflow-hidden hover:shadow-xl transition-all duration-300 border-purple-200">
                  <motion.div
                    className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  />
                  <CardHeader className="p-3 pb-2 relative">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-medium text-purple-600 flex items-center gap-1">
                        Entities
                        <InfoTooltip content={tooltips.stats.entities} />
                      </CardTitle>
                      <Database className="h-4 w-4 text-purple-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 relative">
                    <div className="text-2xl font-bold">{entityCount}</div>
                    <p className="text-xs text-muted-foreground">Knowledge items</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <Card className="p-0 card-gradient-pink relative overflow-hidden hover:shadow-xl transition-all duration-300 border-pink-200">
                  <motion.div
                    className="absolute top-0 right-0 w-20 h-20 bg-pink-500/10 rounded-full -mr-10 -mt-10"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  />
                  <CardHeader className="p-3 pb-2 relative">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-medium text-pink-600 flex items-center gap-1">
                        Relations
                        <InfoTooltip content={tooltips.stats.relations} />
                      </CardTitle>
                      <Network className="h-4 w-4 text-pink-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 relative">
                    <div className="text-2xl font-bold">{relationshipCount}</div>
                    <p className="text-xs text-muted-foreground">Connections</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <Card className="p-0 card-gradient-green relative overflow-hidden hover:shadow-xl transition-all duration-300 border-green-200">
                  <motion.div
                    className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                  />
                  <CardHeader className="p-3 pb-2 relative">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-medium text-green-600 flex items-center gap-1">
                        Sessions
                        <InfoTooltip content={tooltips.stats.sessions} />
                      </CardTitle>
                      <Activity className="h-4 w-4 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 relative">
                    <div className="text-2xl font-bold">{sessionCount}</div>
                    <p className="text-xs text-muted-foreground">Conversations</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <Card className="p-0 card-gradient-amber relative overflow-hidden hover:shadow-xl transition-all duration-300 border-amber-200">
                  <motion.div
                    className="absolute top-0 right-0 w-20 h-20 bg-amber-500/20 rounded-full -mr-10 -mt-10"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 w-16 h-16 bg-orange-500/10 rounded-full -ml-8 -mb-8"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                  />
                  <CardHeader className="p-3 pb-2 relative">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-medium text-amber-600 flex items-center gap-1">
                        Tokens
                        <InfoTooltip content={tooltips.stats.totalTokens} />
                      </CardTitle>
                      <Brain className="h-4 w-4 text-amber-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 relative">
                    <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Context budget</p>
                  </CardContent>
                </Card>
            </motion.div>
          </div>
        </div>

        <div className="flex-1 p-4 pt-2 overflow-hidden">
          <div className="h-full grid grid-cols-12 gap-4">
            <div className="col-span-8 flex flex-col gap-4 h-full overflow-hidden">
              <div className="grid grid-cols-3 gap-3 flex-shrink-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <Card className="p-0 card-gradient-slate border-slate-200 relative overflow-hidden hover:shadow-xl transition-all duration-300">
                  <motion.div
                    className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -mr-10 -mt-10"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 2.5 }}
                  />
                  <CardHeader className="p-3 pb-2 relative">
                    <CardTitle className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      Core Memory (Blocks)
                      <InfoTooltip content={tooltips.tokenBudget.coreMemory} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 relative">
                    <div className="text-xl font-bold">{totalBlockTokens.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Always-in-context tokens</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <Card className="p-0 card-gradient-slate border-slate-200 relative overflow-hidden hover:shadow-xl transition-all duration-300">
                  <motion.div
                    className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -mr-10 -mt-10"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 3 }}
                  />
                  <CardHeader className="p-3 pb-2 relative">
                    <CardTitle className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      Entity Memory
                      <InfoTooltip content={tooltips.tokenBudget.entityMemory} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 relative">
                    <div className="text-xl font-bold">{totalEntityTokens.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Retrieved knowledge tokens</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <Card className="p-0 card-gradient-amber border-amber-200 relative overflow-hidden hover:shadow-xl transition-all duration-300">
                  <motion.div
                    className="absolute top-0 right-0 w-20 h-20 bg-amber-500/20 rounded-full -mr-10 -mt-10"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 3.5 }}
                  />
                  <CardHeader className="p-3 pb-2 relative">
                    <CardTitle className="text-xs font-medium text-amber-600 flex items-center gap-1">
                      Total Context
                      <InfoTooltip content={tooltips.tokenBudget.totalContext} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 relative">
                    <div className="text-xl font-bold">{totalTokens.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {totalTokens > 0 ? `${((totalTokens / 200000) * 100).toFixed(1)}% of 200K budget` : 'No tokens calculated yet'}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              </div>

              <div className="grid grid-cols-2 gap-4 flex-1 min-h-0 max-h-[400px] overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="h-full"
              >
                <Card className="h-full p-0 flex flex-col card-gradient-slate hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-sm font-semibold">Token Distribution by Category</CardTitle>
                    <p className="text-xs text-muted-foreground">Memory usage by entity type</p>
                  </CardHeader>
                <CardContent className="p-4 pt-0 flex-1 flex flex-col items-center justify-center min-h-0">
                  {categoryChartData.length > 0 ? (
                    <div className="w-full h-full flex items-center justify-center min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius="55%"
                            outerRadius="75%"
                            paddingAngle={3}
                            dataKey="value"
                            label={({ value }) => value.toLocaleString()}
                            labelLine={false}
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
                            formatter={(value: number, _name: string, props) => {
                              const total = categoryChartData.reduce((sum, item) => sum + item.value, 0);
                              const percent = ((value / total) * 100).toFixed(1);
                              return [
                                <>
                                  <div>{value.toLocaleString()} tokens</div>
                                  <div>{percent}% ({props.payload.count} items)</div>
                                </>,
                                props.payload.name
                              ];
                            }}
                          />
                          <Legend
                            iconSize={10}
                            wrapperStyle={{ fontSize: '11px' }}
                            layout="horizontal"
                            align="center"
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No entities yet</div>
                  )}
                </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="h-full"
              >
                <Card className="h-full p-0 flex flex-col card-gradient-blue hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-sm font-semibold">Token Distribution by Memory Tier</CardTitle>
                    <p className="text-xs text-muted-foreground">Short-term vs long-term usage</p>
                  </CardHeader>
                <CardContent className="p-4 pt-0 flex-1 flex flex-col items-center justify-center min-h-0">
                  {tierChartData.length > 0 ? (
                    <div className="w-full h-full flex items-center justify-center min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={tierChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius="55%"
                            outerRadius="75%"
                            paddingAngle={3}
                            dataKey="value"
                            label={({ value }) => value.toLocaleString()}
                            labelLine={false}
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
                            formatter={(value: number, _name: string, props) => {
                              const total = tierChartData.reduce((sum, item) => sum + item.value, 0);
                              const percent = ((value / total) * 100).toFixed(1);
                              return [
                                <>
                                  <div>{value.toLocaleString()} tokens</div>
                                  <div>{percent}% ({props.payload.count} items)</div>
                                </>,
                                props.payload.name
                              ];
                            }}
                          />
                          <Legend
                            iconSize={10}
                            wrapperStyle={{ fontSize: '11px' }}
                            layout="horizontal"
                            align="center"
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No tier data</div>
                  )}
                </CardContent>
                </Card>
              </motion.div>
              </div>
            </div>

            <div className="col-span-4 h-full min-h-0">
            <Card className="h-full flex flex-col p-0 card-gradient-slate overflow-hidden">
              <CardHeader className="p-4 pb-3 flex-shrink-0 border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    Audit Log
                  </CardTitle>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-green-600 border-green-200 text-xs h-5 px-1.5">
                      <PlusCircle className="h-2.5 w-2.5 mr-0.5" />
                      {insertCount}
                    </Badge>
                    <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs h-5 px-1.5">
                      <Edit className="h-2.5 w-2.5 mr-0.5" />
                      {updateCount}
                    </Badge>
                    <Badge variant="outline" className="text-red-600 border-red-200 text-xs h-5 px-1.5">
                      <Trash2 className="h-2.5 w-2.5 mr-0.5" />
                      {deleteCount}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Protected database changes</p>
              </CardHeader>
              <CardContent className="p-3 pt-3 flex-1 min-h-0 overflow-hidden">
                <div className="h-full overflow-y-auto audit-log-container" onScroll={handleScroll}>
                  {auditLogs.length > 0 ? (
                    <div className="space-y-2">
                        {auditLogs.map((entry, idx) => {
                          let icon = <PlusCircle className="h-3.5 w-3.5" />;
                          let iconBgColor = 'bg-green-500/10';
                          let iconColor = 'text-green-600';
                          let borderColor = 'border-green-500/20';

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
                                {entry.session_id && (
                                  <p className="text-muted-foreground">Session: {entry.session_id.substring(0, 8)}...</p>
                                )}
                              </div>

                              {entry.old_data && (
                                <div>
                                  <p className="font-semibold">Old Data</p>
                                  <div className="text-xs bg-slate-800 p-2 rounded overflow-auto max-h-32 border border-slate-700">
                                    {highlightedJson[entry.id]?.old ? (
                                      <div
                                        className="[&_pre]:bg-transparent [&_pre]:m-0 [&_pre]:p-0 [&_code]:text-xs"
                                        dangerouslySetInnerHTML={{ __html: highlightedJson[entry.id].old || '' }}
                                      />
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
                                      <div
                                        className="[&_pre]:bg-transparent [&_pre]:m-0 [&_pre]:p-0 [&_code]:text-xs"
                                        dangerouslySetInnerHTML={{ __html: highlightedJson[entry.id].new || '' }}
                                      />
                                    ) : (
                                      <pre className="text-slate-300">{JSON.stringify(entry.new_data, null, 2)}</pre>
                                    )}
                                  </div>
                                </div>
                              )}

                              {entry.changed_fields && entry.changed_fields.length > 0 && (
                                <div>
                                  <p className="font-semibold">Changed Fields</p>
                                  <div className="flex flex-wrap gap-1">
                                    {entry.changed_fields.map((field) => (
                                      <Badge key={field} variant="secondary" className="text-xs bg-slate-700 text-slate-200 border-slate-600">
                                        {field}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <p className="text-muted-foreground pt-2 border-t border-slate-600">
                                {new Date(entry.timestamp).toLocaleString()}
                              </p>
                            </div>
                          );

                          return (
                            <motion.div
                              key={entry.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: Math.min(idx * 0.02, 0.5) }}
                              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
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
                                    {new Date(entry.timestamp).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                              </div>
                              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <InfoTooltip content={tooltipContent} side="left" maxWidth="450px" />
                              </div>
                            </motion.div>
                          );
                        })}
                        {isLoading && (
                          <div className="text-center py-2 text-xs text-muted-foreground">
                            Loading more...
                          </div>
                        )}
                      </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-muted-foreground"
                    >
                      <Shield className="h-8 w-8 mb-2 opacity-20" />
                      <div className="text-sm">No audit entries yet</div>
                      <div className="text-xs mt-1">Changes will appear here</div>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  )
}
