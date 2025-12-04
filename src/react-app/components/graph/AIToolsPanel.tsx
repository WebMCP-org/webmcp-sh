import { useState } from 'react';
import { Wand2, ChevronDown, ChevronUp, Search, Navigation, PlusCircle, Link2, RotateCcw } from 'lucide-react';
import { GRAPH_3D_TOOLS, GRAPH_3D_EXAMPLE_PROMPTS, type Graph3DToolMetadata } from '@/lib/graph/tools-metadata';

/** Map icon names to Lucide components */
const ICON_MAP = {
  Search,
  Navigation,
  PlusCircle,
  Link2,
  RotateCcw,
} as const;

/**
 * Collapsible panel displaying available AI tools for the 3D graph
 *
 * Shows users what tools are available and how to use them with natural
 * language prompts or direct tool calls. Positioned in the bottom-left
 * of the 3D graph view.
 *
 * @example
 * ```tsx
 * <div className="relative">
 *   <KG3D nodes={nodes} links={links} />
 *   <AIToolsPanel />
 * </div>
 * ```
 *
 * @see src/react-app/lib/graph/tools-metadata.ts - Tool definitions
 * @see src/react-app/hooks/useMCPGraph3DTools.ts - Tool implementations
 */
export function AIToolsPanel() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 bg-card/95 backdrop-blur-sm rounded-lg shadow-xl border border-border z-10 max-w-[320px] md:max-w-sm overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-2 md:p-3 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" />
          <span className="font-semibold text-xs md:text-sm text-foreground">AI Tools</span>
          <span className="text-[10px] md:text-xs text-muted-foreground">
            ({GRAPH_3D_TOOLS.length} available)
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-border max-h-[50vh] overflow-y-auto">
          <ExamplePrompts />
          <ToolsList tools={GRAPH_3D_TOOLS} />
        </div>
      )}
    </div>
  );
}

/**
 * Display example natural language prompts
 */
function ExamplePrompts() {
  return (
    <div className="p-2 md:p-3 space-y-2">
      <p className="text-[10px] md:text-xs text-muted-foreground">
        Ask the AI to help you explore the graph. Examples:
      </p>
      <div className="space-y-1 text-[10px] md:text-xs text-muted-foreground italic">
        {GRAPH_3D_EXAMPLE_PROMPTS.map((prompt) => (
          <p key={prompt}>{prompt}</p>
        ))}
      </div>
    </div>
  );
}

/**
 * Display list of available tools with examples
 */
function ToolsList({ tools }: { tools: readonly Graph3DToolMetadata[] }) {
  return (
    <div className="border-t border-border">
      {tools.map((tool) => (
        <ToolItem key={tool.name} tool={tool} />
      ))}
    </div>
  );
}

/**
 * Single tool item with icon, description, and example
 */
function ToolItem({ tool }: { tool: Graph3DToolMetadata }) {
  const Icon = ICON_MAP[tool.icon];

  return (
    <div className="p-2 md:p-3 border-b border-border last:border-b-0 hover:bg-accent/30 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
        <span className="font-medium text-xs md:text-sm text-foreground">{tool.title}</span>
      </div>
      <p className="text-[10px] md:text-xs text-muted-foreground mb-1.5">{tool.description}</p>
      <code className="block text-[9px] md:text-[10px] bg-muted/50 px-1.5 py-1 rounded text-foreground/80 overflow-x-auto">
        {tool.example}
      </code>
    </div>
  );
}
