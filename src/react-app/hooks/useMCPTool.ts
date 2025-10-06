import { useEffect, useCallback, useState, useRef } from 'react';
import { z } from 'zod';
import type {
  CallToolResult,
  ToolAnnotations,
} from '@modelcontextprotocol/sdk/types.js';
import { isToolRegistered, markToolRegistered, markToolUnregistered } from '@/lib/webmcp/toolRegistry';

/**
 * Elicitation configuration for user confirmation
 */
export interface ElicitationConfig {
  /** Message to show the user */
  message: string;
  /** Required fields to collect from user */
  fields?: Record<string, z.ZodTypeAny>;
  /** Only elicit if this condition is true */
  when?: (input: unknown) => boolean;
}

/**
 * Configuration for an MCP tool
 */
export interface MCPToolConfig<
  TInputSchema extends Record<string, z.ZodTypeAny>,
  TOutput = string
> {
  /** Tool name (e.g., 'posts_like') */
  name: string;
  /** Human-readable description */
  description: string;
  /** Input parameter schemas */
  inputSchema?: TInputSchema;
  /** Output schema (optional) */
  outputSchema?: Record<string, z.ZodTypeAny>;
  /** Tool metadata annotations */
  annotations?: ToolAnnotations;
  /** Elicitation config for user confirmation */
  elicitation?: ElicitationConfig;
  /** The handler function */
  handler: (input: z.infer<z.ZodObject<TInputSchema>>) => Promise<TOutput> | TOutput;
  /** Format output for MCP response */
  formatOutput?: (output: TOutput) => string;
  /** Called when tool execution fails (application-level error handling) */
  onError?: (error: Error, input: unknown) => void;
}

/**
 * Tool execution state
 */
export interface ToolExecutionState<TOutput = unknown> {
  isExecuting: boolean;
  lastResult: TOutput | null;
  error: Error | null;
  executionCount: number;
}

/**
 * Return type of useMCPTool hook
 */
export interface MCPToolReturn<TOutput = unknown> {
  /** Current execution state */
  state: ToolExecutionState<TOutput>;
  /** Manually execute the tool (for testing/debugging) */
  execute: (input: unknown) => Promise<TOutput>;
  /** Reset execution state */
  reset: () => void;
}

/**
 * Register an MCP tool with full type safety and async state management
 *
 * Handles React StrictMode by preventing duplicate registrations.
 *
 * @example
 * ```tsx
 * const likeTool = useMCPTool({
 *   name: 'posts_like',
 *   description: 'Like a post by ID',
 *   inputSchema: {
 *     postId: z.string().uuid(),
 *   },
 *   annotations: {
 *     title: 'Like Post',
 *     readOnlyHint: false,
 *     idempotentHint: true,
 *   },
 *   elicitation: {
 *     message: 'Like this post?',
 *     when: (input) => input.postId === 'special-id'
 *   },
 *   handler: async (input) => {
 *     await postQueries.incrementLikes(input.postId);
 *     return { success: true };
 *   },
 *   formatOutput: (result) => `Post liked! ${result.success}`,
 *   onError: (error, input) => {
 *     console.error('Failed to like post:', error);
 *     toast.error(`Could not like post: ${error.message}`);
 *   }
 * });
 *
 * // Access execution state
 * console.log(likeTool.state.isExecuting); // true when tool is running
 * console.log(likeTool.state.error); // Error object if last execution failed
 * console.log(likeTool.state.lastResult); // Result from last successful execution
 *
 * // Manually execute for testing
 * await likeTool.execute({ postId: '123' });
 * ```
 */
export function useMCPTool<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  TInputSchema extends Record<string, z.ZodTypeAny> = {},
  TOutput = string
>(
  config: MCPToolConfig<TInputSchema, TOutput>
): MCPToolReturn<TOutput> {
  const {
    name,
    description,
    inputSchema,
    outputSchema,
    annotations,
    elicitation,
    handler,
    formatOutput = (output) => typeof output === 'string' ? output : JSON.stringify(output, null, 2),
    onError,
  } = config;

  // Track execution state
  const [state, setState] = useState<ToolExecutionState<TOutput>>({
    isExecuting: false,
    lastResult: null,
    error: null,
    executionCount: 0,
  });

  // Track the unregister object returned by MCP SDK
  const unregisterRef = useRef<{ remove: () => void } | null>(null);

  // Use refs to store latest values without triggering re-registration
  const handlerRef = useRef(handler);
  const elicitationRef = useRef(elicitation);
  const formatOutputRef = useRef(formatOutput);
  const onErrorRef = useRef(onError);

  // Update refs when values change (doesn't trigger re-registration)
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    elicitationRef.current = elicitation;
  }, [elicitation]);

  useEffect(() => {
    formatOutputRef.current = formatOutput;
  }, [formatOutput]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Wrapped handler with state management - stable reference
  const execute = useCallback(async (input: unknown): Promise<TOutput> => {
    setState(prev => ({ ...prev, isExecuting: true, error: null }));

    try {
      // Check elicitation using ref
      if (elicitationRef.current && (!elicitationRef.current.when || elicitationRef.current.when(input))) {
        // TODO: In a real implementation, this would show a UI dialog
        // For now, we'll just log it
        console.log(`[MCP Elicitation] ${elicitationRef.current.message}`, input);
      }

      const result = await handlerRef.current(input as z.infer<z.ZodObject<TInputSchema>>);

      setState(prev => ({
        isExecuting: false,
        lastResult: result,
        error: null,
        executionCount: prev.executionCount + 1,
      }));

      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));

      setState(prev => ({
        isExecuting: false,
        lastResult: null,
        error: errorObj,
        executionCount: prev.executionCount + 1,
      }));

      // Call application-level error handler if provided
      if (onErrorRef.current) {
        onErrorRef.current(errorObj, input);
      }

      throw errorObj;
    }
  }, []); // Empty deps - all values come from refs

  const reset = useCallback(() => {
    setState({
      isExecuting: false,
      lastResult: null,
      error: null,
      executionCount: 0,
    });
  }, []);

  // Register the tool with MCP
  useEffect(() => {
    // MCP handler that matches the ToolCallback signature
    // Uses refs so it always has latest handler/formatOutput without re-registering
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    const mcpHandler = async (input: any, _extra: any): Promise<CallToolResult> => {
      try {
        const result = await execute(input);
        const textOutput = formatOutputRef.current(result);

        return {
          content: [{
            type: 'text' as const,
            text: textOutput,
          }],
          isError: false,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        return {
          content: [{
            type: 'text' as const,
            text: `Error: ${errorMessage}`,
          }],
          isError: true,
        };
      }
    };

    // Skip if already in our registry (optimization to avoid SDK call)
    if (isToolRegistered(name)) {
      console.log(`[MCP Tool] 🔄 Tool "${name}" already in registry, skipping`);
      return;
    }

    try {
      // Register the tool and store the unregister function
      const unregister = navigator.mcp.registerTool(name, {
        description,
        ...(inputSchema && { inputSchema }),
        ...(outputSchema && { outputSchema }),
        ...(annotations && { annotations }),
        // @ts-expect-error - MCP SDK expects zod schemas but types are not aligned
      }, mcpHandler);

      // Store the unregister object
      unregisterRef.current = unregister as { remove: () => void };
      markToolRegistered(name);

      console.log(`[MCP Tool] ✅ Registered: ${name}`);
    } catch (error) {
      // Check if this is a duplicate registration error from the MCP SDK
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('already registered')) {
        // Mark as registered - another instance beat us to it
        markToolRegistered(name);
        console.log(`[MCP Tool] 🔄 Tool "${name}" already registered in SDK, syncing registry`);
      } else {
        // Actual error
        console.error(`[MCP Tool] ❌ Failed to register "${name}":`, error);
      }
    }

    // Cleanup on unmount
    return () => {
      if (unregisterRef.current) {
        unregisterRef.current.remove(); // Call the remove method from MCP SDK
        markToolUnregistered(name);
        unregisterRef.current = null;
        console.log(`[MCP Tool] 🗑️  Unregistered: ${name}`);
      }
    };
  }, [name, description, inputSchema, outputSchema, annotations, execute]); // Removed formatOutput from deps

  return {
    state,
    execute,
    reset,
  };
}

/**
 * Simplified hook for read-only context tools
 * Use this for exposing current UI state (e.g., "current post ID")
 */
export function useMCPContextTool<T>(
  name: string,
  description: string,
  getValue: () => T
) {
  return useMCPTool({
    name,
    description,
    annotations: {
      readOnlyHint: true,
      idempotentHint: true,
    },
    handler: async () => getValue(),
  });
}
