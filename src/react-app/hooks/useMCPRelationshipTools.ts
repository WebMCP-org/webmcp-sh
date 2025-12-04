import { z } from 'zod';
import { useWebMCP } from '@mcp-b/react-webmcp';
import { toast } from 'sonner';
import { entity_relationships } from '@/lib/db';
import type { InsertEntityRelationship } from '@/lib/db/types';

/**
 * Hook to register entity relationship CRUD MCP tools
 *
 * Provides AI agents with direct CRUD operations for entity relationships
 * (knowledge graph connections between entities).
 *
 * Should be called in the graph route component.
 */
export function useMCPRelationshipTools() {
  useWebMCP({
    name: 'create_relationship',
    description: `Create a relationship between two entities.

This builds the knowledge graph by connecting entities.

Common relationship types:
- uses: Entity A uses entity B
- related_to: General relationship
- works_on: Person works on project
- knows: Person knows another person
- requires: Skill requires another skill
- part_of: Entity is part of another

Example:
{
  "from_entity_id": "uuid-of-python-skill",
  "to_entity_id": "uuid-of-data-science-skill",
  "relationship_type": "uses",
  "description": "Python is commonly used for data science",
  "strength": 8
}`,
    inputSchema: {
      from_entity_id: z.string().uuid()
        .describe('Source entity ID'),
      to_entity_id: z.string().uuid()
        .describe('Target entity ID'),
      relationship_type: z.string().min(1).max(100)
        .describe('Type of relationship'),
      description: z.string().optional()
        .describe('Optional description of the relationship'),
      strength: z.number().int().min(1).max(10).optional().default(5)
        .describe('Relationship strength (1-10)'),
    },
    annotations: {
      title: 'Create Relationship',
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    handler: async (input) => {
      try {
        const relationship = await entity_relationships.create(input as InsertEntityRelationship);
        toast.success('Relationship created', {
          description: `Created ${input.relationship_type} relationship`,
        });
        return {
          success: true,
          relationship,
          message: `Created relationship: ${input.relationship_type} (strength: ${input.strength})`,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error('Failed to create relationship', { description: errorMessage });
        throw new Error(`Failed to create relationship: ${errorMessage}`);
      }
    },
  });

  useWebMCP({
    name: 'get_entity_relationships',
    description: `Get all relationships for an entity (both incoming and outgoing).

Example:
{
  "entity_id": "uuid-here"
}`,
    inputSchema: {
      entity_id: z.string().uuid()
        .describe('The entity ID to get relationships for'),
    },
    annotations: {
      title: 'Get Entity Relationships',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async (input) => {
      try {
        const outgoing = await entity_relationships.get_outgoing(input.entity_id);
        const incoming = await entity_relationships.get_incoming(input.entity_id);

        return {
          entity_id: input.entity_id,
          outgoing: {
            count: outgoing.length,
            relationships: outgoing,
          },
          incoming: {
            count: incoming.length,
            relationships: incoming,
          },
          total: outgoing.length + incoming.length,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get relationships: ${errorMessage}`);
      }
    },
  });

  useWebMCP({
    name: 'delete_relationship',
    description: `Delete a relationship by ID.

Example:
{
  "id": "uuid-here"
}`,
    inputSchema: {
      id: z.string().uuid().describe('The relationship ID to delete'),
    },
    annotations: {
      title: 'Delete Relationship',
      readOnlyHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async (input) => {
      try {
        await entity_relationships.remove(input.id);
        toast.success('Relationship deleted');
        return {
          success: true,
          message: `Deleted relationship: ${input.id}`,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error('Failed to delete relationship', { description: errorMessage });
        throw new Error(`Failed to delete relationship: ${errorMessage}`);
      }
    },
  });
}
