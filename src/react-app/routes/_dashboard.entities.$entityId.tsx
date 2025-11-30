import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Network, Calendar, TrendingUp, Lightbulb, Heart, Code, AlertCircle, User, FolderOpen, Target, BookOpen, type LucideIcon } from 'lucide-react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { memory_entities, entity_relationships } from '@/lib/db'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_dashboard/entities/$entityId')({
  component: EntityDetailComponent,
})

const categoryIcons: Record<string, { icon: LucideIcon; color: string; bgColor: string }> = {
  fact: { icon: Lightbulb, color: 'text-chart-5', bgColor: 'bg-chart-5/10' },
  preference: { icon: Heart, color: 'text-primary', bgColor: 'bg-primary/10' },
  skill: { icon: Code, color: 'text-chart-3', bgColor: 'bg-chart-3/10' },
  rule: { icon: AlertCircle, color: 'text-primary', bgColor: 'bg-primary/10' },
  context: { icon: BookOpen, color: 'text-chart-2', bgColor: 'bg-chart-2/10' },
  person: { icon: User, color: 'text-chart-4', bgColor: 'bg-chart-4/10' },
  project: { icon: FolderOpen, color: 'text-chart-3', bgColor: 'bg-chart-3/10' },
  goal: { icon: Target, color: 'text-chart-5', bgColor: 'bg-chart-5/10' },
}

function EntityDetailComponent() {
  const { entityId } = Route.useParams()

  // Fetch entity details
  const entityQuery = memory_entities.getMemoryEntityByIdQuerySQL(entityId)
  const entityResult = useLiveQuery<memory_entities.GetMemoryEntityByIdResult>(entityQuery.sql, entityQuery.params)
  const entity = entityResult?.rows?.[0]

  // Fetch outgoing relationships
  const outgoingQuery = entity_relationships.getEntityOutgoingRelationshipsQuerySQL(entityId)
  const outgoingResult = useLiveQuery<entity_relationships.GetEntityOutgoingRelationshipsResult>(outgoingQuery.sql, outgoingQuery.params)
  const outgoing = outgoingResult?.rows ?? []

  // Fetch incoming relationships
  const incomingQuery = entity_relationships.getEntityIncomingRelationshipsQuerySQL(entityId)
  const incomingResult = useLiveQuery<entity_relationships.GetEntityIncomingRelationshipsResult>(incomingQuery.sql, incomingQuery.params)
  const incoming = incomingResult?.rows ?? []

  const relationships = [...outgoing.map(r => ({ ...r.relationship, target: r.target })), ...incoming.map(r => ({ ...r.relationship, source: r.source }))]

  if (!entity) {
    return <div className="p-6">Entity not found</div>
  }

  const categoryConfig = categoryIcons[entity.category] || categoryIcons.context
  const Icon = categoryConfig.icon

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Compact Header */}
      <div className="border-b border-divide px-6 py-4">
        <Link to="/entities">
          <Button variant="ghost" size="sm" className="mb-2 -ml-2">
            <ArrowLeft className="h-3 w-3 mr-1" />
            Back
          </Button>
        </Link>
        <div className="flex items-start gap-3">
          <div className={`h-12 w-12 rounded-lg ${categoryConfig.bgColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`h-6 w-6 ${categoryConfig.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-primary">{entity.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {entity.category}
              </span>
              <span className="text-xs text-muted-foreground">
                {entity.confidence}% confidence
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Description */}
        <Card>
          <CardHeader className="pb-2 px-4 pt-3">
            <CardTitle className="text-sm">Description</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-sm text-muted-foreground">{entity.description}</p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardHeader className="pb-2 px-4 pt-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <CardTitle className="text-xs">Importance</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-2xl font-bold text-primary">{entity.importance_score}/100</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 px-4 pt-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <CardTitle className="text-xs">Mentions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-2xl font-bold text-primary">{entity.mention_count}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tags */}
        {entity.tags.length > 0 && (
          <Card>
            <CardHeader className="pb-2 px-4 pt-3">
              <CardTitle className="text-sm">Tags</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="flex flex-wrap gap-1.5">
                {entity.tags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded text-xs bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Relationships */}
        {relationships.length > 0 && (
          <Card>
            <CardHeader className="pb-2 px-4 pt-3">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Relationships ({relationships.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-3 space-y-2">
              {relationships.slice(0, 5).map((rel) => (
                <div key={rel.id} className="flex items-center justify-between text-xs p-2 rounded bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-primary">
                      {rel.relationship_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      → {'target' in rel ? rel.target?.name : rel.source?.name}
                    </span>
                  </div>
                  <span className="text-muted-foreground ml-2">
                    {rel.strength}/10
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
